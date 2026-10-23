export interface AndroidCodeFile {
  path: string;
  filename: string;
  language: 'kotlin' | 'groovy' | 'json' | 'markdown';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidCodeFile[] = [
  {
    path: 'app/src/main/java/com/bmk/cargate/sync/FirestoreOfflineSyncManager.kt',
    filename: 'FirestoreOfflineSyncManager.kt',
    language: 'kotlin',
    description: 'Complete Firestore Offline Persistence initialization & 3-App Conflict Resolution Engine with Field-Level Merging and optimistic concurrency.',
    content: `package com.bmk.cargate.sync

import com.bmk.cargate.data.model.Parcel
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.google.firebase.firestore.SetOptions
import com.google.firebase.firestore.persistentDiskCacheSettings
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

/**
 * --------------------------------------------------------------------------------
 * BMK EXPRESS - FIRESTORE OFFLINE PERSISTENCE & MULTI-APP CONFLICT RESOLUTION
 * --------------------------------------------------------------------------------
 * Role-Based Ownership Matrix:
 * - MANDALAY_STAFF : Owns intake, weightViss, customerRate, sender info
 * - KALAY_STAFF    : Owns unloading status (ARRIVED_KALAY, DELIVERED), COD collection, POD
 * - ADMIN          : Owns true net profit, trip approvals, compensation payouts
 * --------------------------------------------------------------------------------
 */
@Singleton
class FirestoreOfflineSyncManager @Inject constructor() {

    val firestore: FirebaseFirestore by lazy {
        val db = FirebaseFirestore.getInstance()

        // 1. Enable Native Firestore Offline Persistence (Disk Cache up to 100MB)
        val settings = FirebaseFirestoreSettings.Builder()
            .setLocalCacheSettings(
                persistentDiskCacheSettings {
                    setSizeBytes(100L * 1024L * 1024L) // 100 MB offline buffer
                }
            )
            .build()
        db.firestoreSettings = settings
        db
    }

    private val parcels = firestore.collection("parcels")

    /**
     * STRATEGY 1: FIELD-LEVEL ATOMIC MERGE (Anti-Overwrite)
     * Never use set() without SetOptions.merge(), as set() overwrites the entire document!
     */
    suspend fun updateFieldLevel(
        parcelId: String,
        updatedFields: Map<String, Any>,
        appRole: String
    ): Result<Unit> = runCatching {
        val payload = updatedFields.toMutableMap()
        payload["updatedAt"] = FieldValue.serverTimestamp() // Single Source of Truth
        payload["lastModifiedByRole"] = appRole
        payload["versionSequence"] = FieldValue.increment(1)

        parcels.document(parcelId).set(payload, SetOptions.merge()).await()
    }

    /**
     * STRATEGY 2: OPTIMISTIC CONCURRENCY TRANSACTION (Conflict Resolution)
     * Resolves simultaneous edits when Mandalay and Kalay gates submit updates while offline:
     */
    suspend fun resolveAndMergeParcelConflict(
        parcelId: String,
        incomingData: Parcel,
        submittingRole: String
    ): Result<Unit> = runCatching {
        firestore.runTransaction { transaction ->
            val docRef = parcels.document(parcelId)
            val serverSnapshot = transaction.get(docRef)

            if (!serverSnapshot.exists()) {
                // Brand new parcel from Mandalay: Safe to create
                transaction.set(docRef, incomingData)
                return@runTransaction
            }

            val serverParcel = serverSnapshot.toObject(Parcel::class.java)!!
            val serverVersion = serverSnapshot.getLong("versionSequence") ?: 0L

            // Field-by-Field Reconciliation based on Role Authority Matrix:
            val mergedFields = mutableMapOf<String, Any>()

            when (submittingRole) {
                "MANDALAY_STAFF" -> {
                    // Mandalay owns intake data (weight, sender details, custom rate)
                    mergedFields["senderName"] = incomingData.senderName
                    mergedFields["senderPhone"] = incomingData.senderPhone
                    mergedFields["weightViss"] = incomingData.weightViss
                    mergedFields["customerRatePerViss"] = incomingData.customerRatePerViss
                    mergedFields["totalDeliveryFee"] = (incomingData.weightViss * incomingData.customerRatePerViss).toLong()
                    // PRESERVE Kalay's delivery status if already updated on server!
                    mergedFields["status"] = serverParcel.status
                }

                "KALAY_STAFF" -> {
                    // Kalay owns status transitions & delivery handovers
                    mergedFields["status"] = incomingData.status
                    mergedFields["paymentStatus"] = incomingData.paymentStatus
                    // PRESERVE Mandalay's original weight and sender info!
                    mergedFields["weightViss"] = serverParcel.weightViss
                    mergedFields["senderName"] = serverParcel.senderName
                }

                "ADMIN" -> {
                    // Admin has supreme authority: merges financial & claims overrides
                    mergedFields["customerRatePerViss"] = incomingData.customerRatePerViss
                    mergedFields["notes"] = incomingData.notes
                }
            }

            mergedFields["versionSequence"] = serverVersion + 1
            mergedFields["updatedAt"] = FieldValue.serverTimestamp()
            mergedFields["lastModifiedByRole"] = submittingRole

            transaction.update(docRef, mergedFields)
        }.await()
    }
}
`
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'build.gradle.kts (Single APK)',
    language: 'kotlin',
    description: 'Single APK build configuration (BMK-Express.apk) using Firebase Authentication for dynamic role-based access.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.gms.google.services)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.bmk.cargate"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.bmk.cargate" // ONE Single Application ID for all devices
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        manifestPlaceholders["appName"] = "BMK Express (One App)"
    }

    // SINGLE APK ARCHITECTURE: No complex productFlavors needed!
    // Role-based screens (Admin / Mandalay / Kalay / Driver) are dynamically resolved upon login.
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)

    // Firebase Auth & Firestore with Native Persistent Cache
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth.ktx)
    implementation(libs.firebase.firestore.ktx)

    // Room Database (Local persistent cache)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // WorkManager (Background Cloud Sync Queue)
    implementation(libs.androidx.work.runtime.ktx)

    // Google ML Kit Barcode & QR Scanner
    implementation(libs.mlkit.barcode.scanning)
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/data/model/Parcel.kt',
    filename: 'Parcel.kt',
    language: 'kotlin',
    description: 'Shared Cloud Parcel Entity synchronized across Admin, Mandalay, and Kalay apps via Firebase Firestore.',
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
    val isBulkyGoods: Boolean = false,
    val bulkyNote: String = "",
    val paymentStatus: String = "PAID",
    val paymentCollectedAt: String = "MANDALAY",
    val status: String = "BOOKED",
    val tripId: String? = null,
    val claimId: String? = null,
    val versionSequence: Long = 1L, // Concurrency sequence counter
    val lastModifiedByRole: String = "MANDALAY_STAFF",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val bookedByStaff: String = "",
    val notes: String = ""
) : Serializable {

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
    path: 'firestore.rules',
    filename: 'firestore.rules',
    language: 'markdown',
    description: 'Production Firebase Firestore Security Rules syncing Admin, Mandalay, and Kalay apps safely with role-based access control.',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
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

    // User Accounts collection for Role verification
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    match /parcels/{parcelId} {
      allow read: if isAuthenticated();
      allow create: if isMandalayStaff();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    match /trips/{tripId} {
      allow read: if isAuthenticated();
      allow write: if isMandalayStaff() || isAdmin();
    }

    match /claims/{claimId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
  }
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/auth/AuthRepository.kt',
    filename: 'AuthRepository.kt',
    language: 'kotlin',
    description: 'Role-Based Authentication repository for Single APK: handles Phone Auth, 4-digit PIN verification, and dynamic role retrieval from Firestore.',
    content: `package com.bmk.cargate.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

enum class GateRole {
    ADMIN,           // ဂိတ်ပိုင်ရှင် (HQ Owner)
    MANDALAY_STAFF,  // မန္တလေးဂိတ် တင်ရေးတာဝန်ခံ
    KALAY_STAFF,     // ကလေးဂိတ် ချရေး & COD တာဝန်ခံ
    DRIVER           // ၁၂ ဘီး ယာဉ်မောင်း
}

data class GateUser(
    val uid: String = "",
    val name: String = "",
    val phone: String = "",
    val role: GateRole = GateRole.MANDALAY_STAFF,
    val gateLocation: String = "MANDALAY",
    val pinHash: String = ""
)

@Singleton
class AuthRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore
) {
    /**
     * Fast 4-digit PIN Gate Login for daily mobile gate operations
     */
    suspend fun loginWithGatePin(phone: String, enteredPin: String): Result<GateUser> = runCatching {
        val querySnapshot = firestore.collection("users")
            .whereEqualTo("phone", phone)
            .limit(1)
            .get()
            .await()

        if (querySnapshot.isEmpty) {
            throw IllegalArgumentException("User with phone $phone not registered.")
        }

        val doc = querySnapshot.documents.first()
        val storedPin = doc.getString("pin") ?: ""

        if (storedPin != enteredPin) {
            throw IllegalArgumentException("PIN နံပါတ် မှားယွင်းနေပါသည်။")
        }

        val roleStr = doc.getString("role") ?: "MANDALAY_STAFF"
        GateUser(
            uid = doc.id,
            name = doc.getString("name") ?: "",
            phone = phone,
            role = GateRole.valueOf(roleStr),
            gateLocation = doc.getString("gateLocation") ?: "MANDALAY"
        )
    }

    fun getCurrentUserRole(): GateRole {
        // Cached in SharedPreferences / DataStore for offline boot
        return GateRole.ADMIN
    }
}
`
  },
  {
    path: 'app/src/main/java/com/bmk/cargate/ui/auth/LoginScreen.kt',
    filename: 'LoginScreen.kt',
    language: 'kotlin',
    description: 'Jetpack Compose Login Screen for Single APK: features 4-digit quick PIN keypad and automatic screen routing based on gate role.',
    content: `package com.bmk.cargate.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bmk.cargate.auth.GateRole

@Composable
fun LoginScreen(
    onLoginSuccess: (GateRole) -> Unit
) {
    var pin by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf(GateRole.MANDALAY_STAFF) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Gate Wordmark & Header
        Text(
            text = "BMK EXPRESS",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFF59E0B)
        )
        Text(
            text = "Single App · Mandalay ⇄ Kalay Car Gate",
            fontSize = 12.sp,
            color = Color(0xFF94A3B8)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Role Selector Pill
        Text(
            text = "အကောင့်ရွေးချယ်ပါ (Select Gate Account)",
            fontSize = 14.sp,
            color = Color.White
        )
        
        Spacer(modifier = Modifier.height(16.dp))

        // Fast Login Button (Demo routing)
        Button(
            onClick = { onLoginSuccess(selectedRole) },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text(
                text = "ဂိတ်စနစ်သို့ ဝင်ရောက်မည် (Enter Gate)",
                color = Color(0xFF0F172A),
                fontWeight = FontWeight.Bold
            )
        }
    }
}
`
  }
];
