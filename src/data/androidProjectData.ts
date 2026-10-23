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
    description: 'Data model with automated business calculations (1200 MMK/viss revenue, 1100 truck, 25 MDY labor, 25 Kalay labor, 50 net margin).',
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
    val customerRatePerViss: Long = 1200L,
    val paymentStatus: String = "PAID", // PAID, UNPAID, COD
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

    val baseNetProfit: Long
        get() = totalDeliveryFee - (truckExpense + mandalayLaborFee + kalayLaborFee)
        // Equivalently: (weightViss * 50L).toLong()
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/data/model/Claim.kt',
    filename: 'Claim.kt',
    language: 'kotlin',
    description: 'Road damage and loss compensation claim model with deduction logic from Gate earnings.',
    content: `package com.bmk.cargate.data.model

import com.google.firebase.firestore.DocumentId
import java.io.Serializable

enum class IncidentType {
    LOST,      // လမ်းခရီး ပျောက်ဆုံးမှု
    DAMAGED,   // ကုန်ပစ္စည်း မိုးရေစို/ကွဲအက် ပျက်စီးမှု
    SHORTAGE   // အရေအတွက် လျော့နည်းမှု
}

enum class ClaimStatus {
    PENDING,        // စိစစ်ဆဲ
    APPROVED_PAID,  // လျော်ကြေးထုတ်ပေးပြီး (ဂိတ်အမြတ်မှ ချက်ချင်းနုတ်ယူသည်)
    REJECTED        // ငြင်းပယ်သည်
}

data class Claim(
    @DocumentId
    val id: String = "",
    val parcelId: String = "",
    val parcelCode: String = "",
    val customerName: String = "",
    val customerPhone: String = "",
    val incidentType: IncidentType = IncidentType.LOST,
    val description: String = "",
    val claimedAmount: Long = 0L,         // Customer requested amount (MMK)
    val approvedCompensation: Long = 0L,  // Approved amount deducted from BMK profit
    val status: ClaimStatus = ClaimStatus.PENDING,
    val reportedDate: Long = System.currentTimeMillis(),
    val resolvedDate: Long? = null,
    val reportedBy: String = "",
    val photoUrl: String = ""
) : Serializable
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/data/local/ParcelEntity.kt',
    filename: 'ParcelEntity.kt',
    language: 'kotlin',
    description: 'Room Database Entity for robust offline-first caching and sync status.',
    content: `package com.bmk.cargate.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.bmk.cargate.data.model.Parcel

@Entity(tableName = "parcels")
data class ParcelEntity(
    @PrimaryKey
    val id: String,
    val qrCode: String,
    val senderName: String,
    val senderPhone: String,
    val senderAddress: String,
    val receiverName: String,
    val receiverPhone: String,
    val receiverAddress: String,
    val itemType: String,
    val itemDescription: String,
    val packageCount: Int,
    val weightViss: Double,
    val customerRatePerViss: Long,
    val paymentStatus: String,
    val paymentCollectedAt: String,
    val status: String,
    val tripId: String?,
    val claimId: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val bookedByStaff: String,
    val notes: String,
    // Offline sync state flag
    val isPendingSync: Boolean = false
) {
    fun toDomain(): Parcel = Parcel(
        id = id,
        qrCode = qrCode,
        senderName = senderName,
        senderPhone = senderPhone,
        senderAddress = senderAddress,
        receiverName = receiverName,
        receiverPhone = receiverPhone,
        receiverAddress = receiverAddress,
        itemType = itemType,
        itemDescription = itemDescription,
        packageCount = packageCount,
        weightViss = weightViss,
        customerRatePerViss = customerRatePerViss,
        paymentStatus = paymentStatus,
        paymentCollectedAt = paymentCollectedAt,
        status = status,
        tripId = tripId,
        claimId = claimId,
        createdAt = createdAt,
        updatedAt = updatedAt,
        bookedByStaff = bookedByStaff,
        notes = notes
    )

    companion object {
        fun fromDomain(parcel: Parcel, isPendingSync: Boolean = false): ParcelEntity =
            ParcelEntity(
                id = parcel.id,
                qrCode = parcel.qrCode,
                senderName = parcel.senderName,
                senderPhone = parcel.senderPhone,
                senderAddress = parcel.senderAddress,
                receiverName = parcel.receiverName,
                receiverPhone = parcel.receiverPhone,
                receiverAddress = parcel.receiverAddress,
                itemType = parcel.itemType,
                itemDescription = parcel.itemDescription,
                packageCount = parcel.packageCount,
                weightViss = parcel.weightViss,
                customerRatePerViss = parcel.customerRatePerViss,
                paymentStatus = parcel.paymentStatus,
                paymentCollectedAt = parcel.paymentCollectedAt,
                status = parcel.status,
                tripId = parcel.tripId,
                claimId = parcel.claimId,
                createdAt = parcel.createdAt,
                updatedAt = parcel.updatedAt,
                bookedByStaff = parcel.bookedByStaff,
                notes = parcel.notes,
                isPendingSync = isPendingSync
            )
    }
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/data/local/ParcelDao.kt',
    filename: 'ParcelDao.kt',
    language: 'kotlin',
    description: 'Room DAO for offline queries, reactive Flow streams, and sync queues.',
    content: `package com.bmk.cargate.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ParcelDao {
    @Query("SELECT * FROM parcels ORDER BY createdAt DESC")
    fun getAllParcels(): Flow<List<ParcelEntity>>

    @Query("SELECT * FROM parcels WHERE id = :parcelId")
    suspend fun getParcelById(parcelId: String): ParcelEntity?

    @Query("SELECT * FROM parcels WHERE isPendingSync = 1")
    suspend fun getPendingSyncParcels(): List<ParcelEntity>

    @Query("SELECT * FROM parcels WHERE status = :status ORDER BY createdAt DESC")
    fun getParcelsByStatus(status: String): Flow<List<ParcelEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(parcel: ParcelEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(parcels: List<ParcelEntity>)

    @Query("UPDATE parcels SET isPendingSync = 0 WHERE id = :parcelId")
    suspend fun markAsSynced(parcelId: String)

    @Delete
    suspend fun delete(parcel: ParcelEntity)
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/data/repository/ParcelRepository.kt',
    filename: 'ParcelRepository.kt',
    language: 'kotlin',
    description: 'Offline-First Repository synchronizing local Room DB with Firebase Firestore.',
    content: `package com.bmk.cargate.data.repository

import com.bmk.cargate.data.local.ParcelDao
import com.bmk.cargate.data.local.ParcelEntity
import com.bmk.cargate.data.model.Parcel
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Source
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ParcelRepository @Inject constructor(
    private val parcelDao: ParcelDao,
    private val firestore: FirebaseFirestore
) {
    private val parcelsCollection = firestore.collection("parcels")

    // Reactive flow straight from Room database for instantaneous UI render
    val allParcels: Flow<List<Parcel>> = parcelDao.getAllParcels().map { entities ->
        entities.map { it.toDomain() }
    }

    /**
     * Book new parcel:
     * 1. Saves instantly to local Room DB with isPendingSync = true (offline capability)
     * 2. Pushes to Cloud Firestore when network is available
     */
    suspend fun bookParcel(parcel: Parcel): Result<Unit> {
        return try {
            // Step 1: Write to local cache first
            val localEntity = ParcelEntity.fromDomain(parcel, isPendingSync = true)
            parcelDao.insertOrUpdate(localEntity)

            // Step 2: Try pushing to Firestore
            try {
                parcelsCollection.document(parcel.id).set(parcel).await()
                parcelDao.markAsSynced(parcel.id)
            } catch (networkException: Exception) {
                // Device is offline; local record remains marked as pending sync
                // Android WorkManager will sync it once network is restored
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Real-time Firestore sync listener:
     * Keep local Room DB updated whenever cloud data changes
     */
    fun startRealtimeSync(scope: CoroutineScope) {
        parcelsCollection.addSnapshotListener { snapshot, error ->
            if (error != null || snapshot == null) return@addSnapshotListener
            scope.launch(Dispatchers.IO) {
                val remoteParcels = snapshot.documents.mapNotNull { it.toObject(Parcel::class.java) }
                val entities = remoteParcels.map { ParcelEntity.fromDomain(it, isPendingSync = false) }
                parcelDao.insertAll(entities)
            }
        }
    }

    /**
     * Flush pending unsynced offline records to Firestore
     */
    suspend fun syncPendingParcels() {
        val pending = parcelDao.getPendingSyncParcels()
        for (item in pending) {
            try {
                parcelsCollection.document(item.id).set(item.toDomain()).await()
                parcelDao.markAsSynced(item.id)
            } catch (_: Exception) {
                // Will retry on next sync cycle
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/ui/viewmodel/ParcelViewModel.kt',
    filename: 'ParcelViewModel.kt',
    language: 'kotlin',
    description: 'Jetpack ViewModel managing state, financial calculations, and claim loss deductions.',
    content: `package com.bmk.cargate.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bmk.cargate.data.model.Claim
import com.bmk.cargate.data.model.ClaimStatus
import com.bmk.cargate.data.model.Parcel
import com.bmk.cargate.data.repository.ParcelRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class FinancialUiState(
    val totalParcelsCount: Int = 0,
    val totalWeightViss: Double = 0.0,
    val totalRevenue: Long = 0L,         // weight * 1200 MMK
    val totalTruckExpense: Long = 0L,    // weight * 1100 MMK
    val totalMdyLabor: Long = 0L,        // weight * 25 MMK
    val totalKalayLabor: Long = 0L,      // weight * 25 MMK
    val totalOperatingExpense: Long = 0L,// Truck + Labor
    val grossBaseProfit: Long = 0L,      // weight * 50 MMK
    val totalCompensationPaid: Long = 0L,// Deducted road claims
    val trueNetProfit: Long = 0L         // grossBaseProfit - totalCompensationPaid
)

@HiltViewModel
class ParcelViewModel @Inject constructor(
    private val repository: ParcelRepository
) : ViewModel() {

    val parcels: StateFlow<List<Parcel>> = repository.allParcels
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _claims = MutableStateFlow<List<Claim>>(emptyList())
    val claims: StateFlow<List<Claim>> = _claims.asStateFlow()

    // Real-time calculated financial metrics
    val financialState: StateFlow<FinancialUiState> = combine(parcels, claims) { parcelList, claimList ->
        val totalViss = parcelList.sumOf { it.weightViss }
        val revenue = (totalViss * 1200L).toLong()
        val truckCost = (totalViss * 1100L).toLong()
        val mdyLabor = (totalViss * 25L).toLong()
        val kalayLabor = (totalViss * 25L).toLong()
        val opExpense = truckCost + mdyLabor + kalayLabor
        val baseProfit = (totalViss * 50L).toLong()

        // Sum up approved claims that must be deducted from gate earnings
        val approvedClaimsTotal = claimList
            .filter { it.status == ClaimStatus.APPROVED_PAID }
            .sumOf { it.approvedCompensation }

        val netProfit = baseProfit - approvedClaimsTotal

        FinancialUiState(
            totalParcelsCount = parcelList.size,
            totalWeightViss = totalViss,
            totalRevenue = revenue,
            totalTruckExpense = truckCost,
            totalMdyLabor = mdyLabor,
            totalKalayLabor = kalayLabor,
            totalOperatingExpense = opExpense,
            grossBaseProfit = baseProfit,
            totalCompensationPaid = approvedClaimsTotal,
            trueNetProfit = netProfit
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), FinancialUiState())

    init {
        repository.startRealtimeSync(viewModelScope)
    }

    fun bookNewParcel(parcel: Parcel) {
        viewModelScope.launch {
            repository.bookParcel(parcel)
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/ui/screens/AddParcelScreen.kt',
    filename: 'AddParcelScreen.kt',
    language: 'kotlin',
    description: 'Jetpack Compose Screen for booking parcels with instant weight-to-MMK auto calculation.',
    content: `package com.bmk.cargate.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bmk.cargate.data.model.Parcel
import java.text.NumberFormat
import java.util.Locale

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
    var weightInput by remember { mutableStateOf("10") }
    var paymentStatus by remember { mutableStateOf("PAID") }

    val weightViss = weightInput.toDoubleOrNull() ?: 0.0
    // Rates: 1200 customer, 1100 truck, 25 mdy labor, 25 kalay labor, 50 margin
    val totalFee = (weightViss * 1200L).toLong()
    val truckCost = (weightViss * 1100L).toLong()
    val mdyLabor = (weightViss * 25L).toLong()
    val kalayLabor = (weightViss * 25L).toLong()
    val netProfit = (weightViss * 50L).toLong()

    val formatter = NumberFormat.getNumberInstance(Locale.US)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("BMK - ပစ္စည်းအသစ်လက်ခံခြင်း (Mandalay Gate)", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Live Financial Calculation Card
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "ငွေကြေးနှင့် အမြတ်တွက်ချက်မှု (Rate Auto-Calculator)",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("လူကြီးမင်းပေးဆောင်ရမည့်ငွေ (1,200/ပိသာ):")
                        Text("\${formatter.format(totalFee)} MMK", fontWeight = FontWeight.Bold, color = Color(0xFF16A34A))
                    }
                    Divider(modifier = Modifier.padding(vertical = 6.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("၁၂ ဘီး ကားငှါးခ (1,100/ပိသာ):", fontSize = 13.sp)
                        Text("\${formatter.format(truckCost)} MMK", fontSize = 13.sp)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("မန္တလေး တင်ခ အလုပ်သမား (25/ပိသာ):", fontSize = 13.sp)
                        Text("\${formatter.format(mdyLabor)} MMK", fontSize = 13.sp)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("ကလေး ချခ အလုပ်သမား (25/ပိသာ):", fontSize = 13.sp)
                        Text("\${formatter.format(kalayLabor)} MMK", fontSize = 13.sp)
                    }
                    Divider(modifier = Modifier.padding(vertical = 6.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("BMK ဂိတ် အသားတင်အမြတ် (50/ပိသာ):", fontWeight = FontWeight.Bold)
                        Text("\${formatter.format(netProfit)} MMK", fontWeight = FontWeight.Bold, color = Color(0xFF0284C7))
                    }
                }
            }

            // Sender Information Section
            Text("၁။ ပို့သူ အချက်အလက် (မန္တလေး)", fontWeight = FontWeight.SemiBold)
            OutlinedTextField(
                value = senderName,
                onValueChange = { senderName = it },
                label = { Text("ပို့သူအမည် (ဥပမာ ဦးမောင်မောင်)") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = senderPhone,
                onValueChange = { senderPhone = it },
                label = { Text("ပို့သူဖုန်းနံပါတ် (09-xxxxxxxxx)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth()
            )

            // Receiver Information Section
            Text("၂။ လက်ခံသူ အချက်အလက် (ကလေး)", fontWeight = FontWeight.SemiBold)
            OutlinedTextField(
                value = receiverName,
                onValueChange = { receiverName = it },
                label = { Text("လက်ခံသူအမည် (ဥပမာ ဒေါ်ခင်သန်းနွဲ့)") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = receiverPhone,
                onValueChange = { receiverPhone = it },
                label = { Text("လက်ခံသူဖုန်းနံပါတ်") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = receiverAddress,
                onValueChange = { receiverAddress = it },
                label = { Text("ကလေးမြို့ နေရပ်လိပ်စာ (ဥပမာ တာဟန်းရပ်ကွက်)") },
                modifier = Modifier.fillMaxWidth()
            )

            // Parcel Weight (Viss) Section
            Text("၃။ ပစ္စည်းအလေးချိန် (ပိသာ)", fontWeight = FontWeight.SemiBold)
            OutlinedTextField(
                value = weightInput,
                onValueChange = { weightInput = it },
                label = { Text("အလေးချိန် (ပိသာ)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                trailingIcon = { Text("ပိသာ ", fontWeight = FontWeight.Bold) },
                modifier = Modifier.fillMaxWidth()
            )

            // Submit Button
            Button(
                onClick = {
                    val newParcel = Parcel(
                        id = "BMK-\${System.currentTimeMillis().toString().takeLast(6)}",
                        senderName = senderName,
                        senderPhone = senderPhone,
                        receiverName = receiverName,
                        receiverPhone = receiverPhone,
                        receiverAddress = receiverAddress,
                        itemType = itemType,
                        weightViss = weightViss,
                        paymentStatus = paymentStatus,
                        status = "BOOKED"
                    )
                    onSaveSuccess(newParcel)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(8.dp),
                enabled = senderName.isNotBlank() && receiverName.isNotBlank() && weightViss > 0
            ) {
                Icon(Icons.Default.Check, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("ဘောင်ချာထုတ်ပြီး ဂိတ်သွင်းမည်")
            }
        }
    }
}
`
  },
  {
    path: 'firestore.rules',
    filename: 'firestore.rules',
    language: 'markdown',
    description: 'Production Firebase Firestore Security Rules for BMK Role-Based Access Control.',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: Get User Role from users collection
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'ADMIN';
    }

    function isMandalayStaff() {
      return isAuthenticated() && (getUserRole() == 'MANDALAY_STAFF' || isAdmin());
    }

    function isKalayStaff() {
      return isAuthenticated() && (getUserRole() == 'KALAY_STAFF' || isAdmin());
    }

    // Parcels Collection Rules
    match /parcels/{parcelId} {
      // Both gates can read parcel details for lookup & barcode scanning
      allow read: if isAuthenticated();
      
      // Mandalay staff can create bookings
      allow create: if isMandalayStaff() &&
                    request.resource.data.weightViss > 0 &&
                    request.resource.data.customerRatePerViss == 1200;
                    
      // Kalay staff can update status upon arrival/delivery, Admin can update everything
      allow update: if isAuthenticated();
      
      // Only Admin can delete
      allow delete: if isAdmin();
    }

    // 12-Wheel Truck Trips Collection Rules
    match /trips/{tripId} {
      allow read: if isAuthenticated();
      allow write: if isMandalayStaff() || isAdmin();
    }

    // Claims & Road Loss Collection Rules
    match /claims/{claimId} {
      allow read: if isAuthenticated();
      // Kalay or Mandalay staff can file a damage/lost incident
      allow create: if isAuthenticated();
      // Only Admin can approve compensation payouts that deduct from Gate Net Profit
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // User Roles Collection Rules
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
`
  },
  {
    path: 'schema/FirestoreSchema.json',
    filename: 'FirestoreSchema.json',
    language: 'json',
    description: 'Firebase Firestore Collections, Documents, and Data Types Schema specification.',
    content: `{
  "collections": {
    "parcels": {
      "documentId": "string (e.g. BMK-20261023-001)",
      "fields": {
        "qrCode": "string",
        "senderName": "string",
        "senderPhone": "string",
        "senderAddress": "string",
        "receiverName": "string",
        "receiverPhone": "string",
        "receiverAddress": "string",
        "itemType": "string",
        "itemDescription": "string",
        "packageCount": "number",
        "weightViss": "number",
        "customerRatePerViss": "number (default: 1200)",
        "totalDeliveryFee": "number (weightViss * 1200)",
        "truckExpense": "number (weightViss * 1100)",
        "mandalayLaborFee": "number (weightViss * 25)",
        "kalayLaborFee": "number (weightViss * 25)",
        "baseNetProfit": "number (weightViss * 50)",
        "paymentStatus": "string (PAID | UNPAID | COD)",
        "paymentCollectedAt": "string (MANDALAY | KALAY)",
        "status": "string (BOOKED | LOADED | IN_TRANSIT | ARRIVED_KALAY | DELIVERED | CLAIMED_LOST)",
        "tripId": "string (optional)",
        "claimId": "string (optional)",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "bookedByStaff": "string"
      }
    },
    "trips": {
      "documentId": "string (e.g. TRIP-20261023-01)",
      "fields": {
        "truckNumber": "string (e.g. 3B-4521 12-Wheeler)",
        "driverName": "string",
        "driverPhone": "string",
        "departureDate": "string",
        "expectedArrivalDate": "string",
        "route": "string",
        "status": "string (LOADING | IN_TRANSIT | ARRIVED | COMPLETED)",
        "maxCapacityViss": "number",
        "currentLoadedViss": "number",
        "parcelIds": "array of strings",
        "totalTruckRentFee": "number (currentLoadedViss * 1100)",
        "totalMdyLabor": "number (currentLoadedViss * 25)",
        "totalKalayLabor": "number (currentLoadedViss * 25)"
      }
    },
    "claims": {
      "documentId": "string (e.g. CLM-001)",
      "fields": {
        "parcelId": "string",
        "parcelCode": "string",
        "customerName": "string",
        "incidentType": "string (LOST | DAMAGED | SHORTAGE)",
        "description": "string",
        "claimedAmount": "number",
        "approvedCompensation": "number (deducted from Gate profit)",
        "status": "string (PENDING | APPROVED_PAID | REJECTED)",
        "reportedDate": "timestamp",
        "resolvedDate": "timestamp (optional)",
        "photoUrl": "string (optional)"
      }
    }
  }
}`
  }
];
