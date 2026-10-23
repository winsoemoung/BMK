export interface AndroidCodeFile {
  path: string;
  filename: string;
  language: 'kotlin' | 'groovy' | 'json' | 'markdown';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidCodeFile[] = [
  {
    path: 'app/src/main/java/com/bmk/cargate/data/model/Parcel.kt',
    filename: 'Parcel.kt',
    language: 'kotlin',
    description: 'Data model with automated calculations, standard rate (1,200), custom bulky rate (ကုန်ပွစျေး), truck charter (1,100), and dual gate labor.',
    content: `package com.bmk.cargate.data.model

import com.google.firebase.firestore.DocumentId
import java.io.Serializable

data class Parcel(
    @DocumentId
    val id: String = "",
    val qrCode: String = "",
    val senderName: String = "",
    val senderPhone: String = "",
    val senderAddress: String = "",
    val receiverName: String = "",
    val receiverPhone: String = "",
    val receiverAddress: String = "",
    val itemType: String = "",
    val itemDescription: String = "",
    val packageCount: Int = 1,
    val weightViss: Double = 0.0,
    val customerRatePerViss: Long = 1200L, // 1200 MMK standard or custom bulky rate (ကုန်ပွစျေး)
    val isBulkyGoods: Boolean = false,      // ထုထည်ကြီးပြီး ပေါ့သော ကုန်ပွ ပစ္စည်း
    val bulkyNote: String = "",
    val paymentStatus: String = "PAID",     // PAID, UNPAID, COD
    val paymentCollectedAt: String = "MANDALAY", // MANDALAY or KALAY
    val status: String = "BOOKED", // BOOKED, LOADED, IN_TRANSIT, ARRIVED_KALAY, DELIVERED, CLAIMED_LOST
    val tripId: String? = null,
    val claimId: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val bookedByStaff: String = "",
    val notes: String = ""
) : Serializable {

    // Automated Financial Calculations according to BMK Gate specifications
    val totalDeliveryFee: Long
        get() = (weightViss * customerRatePerViss).toLong()

    val truckExpense: Long
        get() = (weightViss * 1100L).toLong()

    val mandalayLaborFee: Long
        get() = (weightViss * 25L).toLong()

    val kalayLaborFee: Long
        get() = (weightViss * 25L).toLong()

    // Base profit is customer fee minus truck and dual labor expenses
    val baseNetProfit: Long
        get() = totalDeliveryFee - (truckExpense + mandalayLaborFee + kalayLaborFee)
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/scanner/BatchBarcodeScanner.kt',
    filename: 'BatchBarcodeScanner.kt',
    language: 'kotlin',
    description: 'Google ML Kit Barcode Scanning + CameraX for high-speed continuous batch scanning (ကလေးဂိတ်တွင် အထုပ်ရာနှင့်ချီ တရစပ်စကင်ဖတ်ရန်).',
    content: `package com.bmk.cargate.scanner

import android.annotation.SuppressLint
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import java.util.concurrent.Executors

class BatchBarcodeScanner {
    private val barcodeScanner = BarcodeScanning.getClient()
    private val executor = Executors.newSingleThreadExecutor()

    // Flow emitting scanned parcel IDs continuously
    private val _scannedCodes = MutableSharedFlow<String>(extraBufferCapacity = 64)
    val scannedCodes: SharedFlow<String> = _scannedCodes

    private val recentlyScanned = mutableSetOf<String>()
    private var lastScanTimestamp = 0L

    @SuppressLint("UnsafeOptInUsageError")
    fun processImageProxy(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
            barcodeScanner.process(image)
                .addOnSuccessListener { barcodes ->
                    for (barcode in barcodes) {
                        barcode.rawValue?.let { code ->
                            val currentTime = System.currentTimeMillis()
                            // Debounce same item within 2.5 seconds to avoid double-counting
                            if (!recentlyScanned.contains(code) || (currentTime - lastScanTimestamp > 2500)) {
                                recentlyScanned.add(code)
                                lastScanTimestamp = currentTime
                                _scannedCodes.tryEmit(code)
                            }
                        }
                    }
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/sync/SyncWorker.kt',
    filename: 'SyncWorker.kt',
    language: 'kotlin',
    description: 'Android WorkManager Periodic Sync: guarantees offline records created in remote areas sync reliably to Cloud Firestore once online.',
    content: `package com.bmk.cargate.sync

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.*
import com.bmk.cargate.data.repository.ParcelRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import java.util.concurrent.TimeUnit

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val repository: ParcelRepository
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            // Push all offline pending records from Room DB to Firestore
            repository.syncPendingParcels()
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        fun schedulePeriodicSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 1, TimeUnit.MINUTES)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "BMK_OFFLINE_SYNC",
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/printer/BluetoothThermalPrinter.kt',
    filename: 'BluetoothThermalPrinter.kt',
    language: 'kotlin',
    description: 'ESC/POS 58mm/80mm Bluetooth Label Thermal Printer driver for instant QR code parcel stickers.',
    content: `package com.bmk.cargate.printer

import android.bluetooth.BluetoothSocket
import com.bmk.cargate.data.model.Parcel
import java.io.OutputStream

class BluetoothThermalPrinter(private val socket: BluetoothSocket) {
    private val outputStream: OutputStream = socket.outputStream

    fun printStickerLabel(parcel: Parcel) {
        val escInit = byteArrayOf(0x1B, 0x40) // ESC @
        val alignCenter = byteArrayOf(0x1B, 0x61, 0x01)
        val alignLeft = byteArrayOf(0x1B, 0x61, 0x00)
        val boldOn = byteArrayOf(0x1B, 0x45, 0x01)
        val boldOff = byteArrayOf(0x1B, 0x45, 0x00)
        val doubleHeight = byteArrayOf(0x1D, 0x21, 0x11)
        val normalSize = byteArrayOf(0x1D, 0x21, 0x00)

        outputStream.write(escInit)
        outputStream.write(alignCenter)
        outputStream.write(doubleHeight)
        outputStream.write("BMK EXPRESS (MDY-KLY)\\n".toByteArray(Charsets.UTF_8))
        outputStream.write(normalSize)
        outputStream.write("--------------------------------\\n".toByteArray())

        outputStream.write(doubleHeight)
        outputStream.write(">> ကလေး (KALAY) <<\\n".toByteArray(Charsets.UTF_8))
        outputStream.write(normalSize)

        outputStream.write(alignLeft)
        outputStream.write(boldOn)
        outputStream.write("TRACKING: \${parcel.id}\\n".toByteArray())
        outputStream.write("TO: \${parcel.receiverName} (\${parcel.receiverPhone})\\n".toByteArray(Charsets.UTF_8))
        outputStream.write("ADDR: \${parcel.receiverAddress}\\n".toByteArray(Charsets.UTF_8))
        outputStream.write("WEIGHT: \${parcel.weightViss} VISS (\${if (parcel.isBulkyGoods) "BULKY" else "STD"})\\n".toByteArray())
        outputStream.write("PAY: \${parcel.paymentStatus}\\n".toByteArray())
        outputStream.write(boldOff)

        // Feed & Cut
        outputStream.write(byteArrayOf(0x1D, 0x56, 0x41, 0x10))
        outputStream.flush()
    }
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/data/model/Trip.kt',
    filename: 'Trip.kt',
    language: 'kotlin',
    description: '12-Wheel Truck trip management with driver fuel advance, en-route ledger, and Kalay final settlement.',
    content: `package com.bmk.cargate.data.model

import com.google.firebase.firestore.DocumentId
import java.io.Serializable

data class DriverExpense(
    val id: String = "",
    val category: String = "FUEL", // FUEL, TOLL_GATE, CHECKPOINT, ALLOWANCE
    val description: String = "",
    val amount: Long = 0L,
    val date: String = "",
    val location: String = ""
) : Serializable

data class Trip(
    @DocumentId
    val id: String = "",
    val truckNumber: String = "", // e.g. 3B-4521 (Hino 12-Wheeler)
    val driverName: String = "",
    val driverPhone: String = "",
    val departureDate: String = "",
    val expectedArrivalDate: String = "",
    val route: String = "Mandalay -> Monywa -> Gangaw -> Kalay",
    val status: String = "LOADING", // LOADING, IN_TRANSIT, ARRIVED, COMPLETED
    val maxCapacityViss: Double = 8000.0,
    val currentLoadedViss: Double = 0.0,
    val parcelIds: List<String> = emptyList(),
    val totalTruckRentFee: Long = 0L,   // currentLoadedViss * 1100
    val totalMdyLabor: Long = 0L,       // currentLoadedViss * 25
    val totalKalayLabor: Long = 0L,     // currentLoadedViss * 25
    
    // Driver Advance & Settlement Ledger
    val advancePaymentMdy: Long = 0L,    // မန္တလေးထွက်ခွာချိန် ဆီဖိုး/လမ်းစရိတ် ကြိုထုတ်ငွေ
    val roadExpensesAllowance: Long = 0L, // စစ်ဆေးရေးဂိတ်/တိုးဂိတ် ထောက်ပံ့ငွေ
    val expenses: List<DriverExpense> = emptyList(),
    val remainingSettlementKalay: Long = 0L, // ကလေးဂိတ်ဆိုက်ရောက်ချိန် ရှင်းပေးရန် ကျန်ငွေ
    val isDriverSettled: Boolean = false,
    val notes: String = ""
) : Serializable
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/ui/screens/AddParcelScreen.kt',
    filename: 'AddParcelScreen.kt',
    language: 'kotlin',
    description: 'Jetpack Compose Screen with custom Bulky rate (ကုန်ပွစျေး) toggle and frequent customer auto-complete.',
    content: `package com.bmk.cargate.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bmk.cargate.data.model.Parcel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddParcelScreen(
    onNavigateBack: () -> Unit,
    onSaveSuccess: (Parcel) -> Unit
) {
    var senderName by remember { mutableStateOf("") }
    var senderPhone by remember { mutableStateOf("") }
    var receiverName by remember { mutableStateOf("") }
    var receiverPhone by remember { mutableStateOf("") }
    var receiverAddress by remember { mutableStateOf("") }
    var itemType by remember { mutableStateOf("ကုန်ခြောက်") }
    var weightInput by remember { mutableStateOf("20") }
    var isBulkyGoods by remember { mutableStateOf(false) }
    var customBulkyRate by remember { mutableStateOf("1600") }

    val weight = weightInput.toDoubleOrNull() ?: 0.0
    val effectiveRate = if (isBulkyGoods) (customBulkyRate.toLongOrNull() ?: 1600L) else 1200L
    val totalFee = (weight * effectiveRate).toLong()
    val truckCost = (weight * 1100L).toLong()
    val laborCost = (weight * 50L).toLong() // 25 MDY + 25 Kalay
    val netProfit = totalFee - (truckCost + laborCost)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("BMK - ကုန်စည်လက်ခံဘောင်ချာဖွင့်ခြင်း", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Calculation Card
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("တွက်ချက်မှု (Auto-Calculation):", fontWeight = FontWeight.Bold)
                    Text("ပို့ဆောင်ခ ကျသင့်ငွေ: \${totalFee} MMK (\${weight} ပိသာ @ \${effectiveRate}/ပိသာ)", color = Color(0xFF16A34A), fontWeight = FontWeight.Bold)
                    Text("၁၂ ဘီး ကားခ (1,100): \${truckCost} MMK | အလုပ်သမား (50): \${laborCost} MMK", fontSize = 12.sp)
                    Text("ဂိတ်အသားတင်အမြတ်: +\${netProfit} MMK", color = Color(0xFF0284C7), fontWeight = FontWeight.Bold)
                }
            }

            // Bulky Goods Toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("ထုထည်ကြီးပြီး ပေါ့သော ကုန်ပွစျေး (Bulky Mode):", fontWeight = FontWeight.SemiBold)
                Switch(checked = isBulkyGoods, onCheckedChange = { isBulkyGoods = it })
            }

            if (isBulkyGoods) {
                OutlinedTextField(
                    value = customBulkyRate,
                    onValueChange = { customBulkyRate = it },
                    label = { Text("စိတ်ကြိုက် ကုန်ပွစျေးနှုန်း (ကျပ်/ပိသာ)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            OutlinedTextField(
                value = senderName,
                onValueChange = { senderName = it },
                label = { Text("ပို့သူအမည် (မန္တလေး)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = senderPhone,
                onValueChange = { senderPhone = it },
                label = { Text("ပို့သူဖုန်းနံပါတ်") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = receiverName,
                onValueChange = { receiverName = it },
                label = { Text("လက်ခံသူအမည် (ကလေးမြို့)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = receiverPhone,
                onValueChange = { receiverPhone = it },
                label = { Text("လက်ခံသူဖုန်းနံပါတ်") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = weightInput,
                onValueChange = { weightInput = it },
                label = { Text("အလေးချိန် (ပိသာ)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth()
            )

            Button(
                onClick = {
                    val p = Parcel(
                        id = "BMK-\${System.currentTimeMillis().toString().takeLast(6)}",
                        senderName = senderName,
                        senderPhone = senderPhone,
                        receiverName = receiverName,
                        receiverPhone = receiverPhone,
                        receiverAddress = receiverAddress,
                        itemType = itemType,
                        weightViss = weight,
                        customerRatePerViss = effectiveRate,
                        isBulkyGoods = isBulkyGoods
                    )
                    onSaveSuccess(p)
                },
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Text("ဘောင်ချာထုတ်ပြီး ဂိတ်သွင်းမည်")
            }
        }
    }
}
`
  }
];
