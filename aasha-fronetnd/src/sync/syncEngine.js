import { getAllRecords, markRecordSynced } from '../indexeddb/db';

const API_URL = 'http://localhost:5000/api/records';

/**
 * Sync pending records from IndexedDB to the backend API
 * Retrieves all records, filters those with syncStatus === "pending",
 * and sends them to the backend. Marks synced records on successful upload.
 */
export async function syncPendingRecords() {
  try {
    const allRecords = await getAllRecords();
    const pendingRecords = allRecords.filter(record => record.syncStatus === 'pending');

    if (pendingRecords.length === 0) {
      console.log('No pending records to sync');
      return;
    }

    console.log(`Found ${pendingRecords.length} pending records to sync`);

    for (const record of pendingRecords) {
      try {
        const payload = {
          patientType: record.patientType,
          rawText: record.rawText,
          language: record.language,
          structured: record.structured,
          createdAt: record.createdAt
        };

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          await markRecordSynced(record.id);
          console.log(`Record ${record.id} synced successfully`);
        } else {
          console.error(`Failed to sync record ${record.id}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error syncing record ${record.id}:`, error);
      }
    }

    console.log('Sync completed');
  } catch (error) {
    console.error('Error during sync:', error);
  }
}
