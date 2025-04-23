package edu.brown.cs.student.main.server.storage;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

// StorageInterface defines operations for interacting with the underlying storage system
// (Firestore) to perform operations for documents.
public interface StorageInterface {

  void addDocument(String uid, String collection_id, String doc_id, Map<String, Object> data);

  List<Map<String, Object>> getCollection(String uid, String collection_id)
      throws InterruptedException, ExecutionException;

  void clearUser(String uid) throws InterruptedException, ExecutionException;

  List<Map<String, Object>> getAllPins(String collectionName)
      throws InterruptedException, ExecutionException;
}
