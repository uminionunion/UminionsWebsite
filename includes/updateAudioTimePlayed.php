<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1); // Set to 1 for development, 0 for production

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $audio_id = $data['audio_id'];

    // Update the `audio_time_actually_played` and `video_played` with the current timestamp
    $stmt = $conn->prepare("UPDATE audios SET audio_time_actually_played = NOW(), video_played = 1 WHERE id = ?");
    $stmt->bind_param('i', $audio_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success']);
    } else {
        throw new Exception("Failed to update play time for audio ID $audio_id");
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
