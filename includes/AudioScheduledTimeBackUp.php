<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1); // Set to 1 for development, 0 for production

try {
    // Query to get the most recent 20 entries that are scheduled to play and haven't been played yet
    $query = "
        SELECT * 
        FROM audios 
        WHERE audio_time_actually_played IS NULL AND video_played = 0 
        ORDER BY audio_scheduled_time_to_play ASC 
        LIMIT 20
    ";
    $result = $conn->query($query);

    $scheduledAudios = [];
    while ($row = $result->fetch_assoc()) {
        $scheduledAudios[] = $row;
    }

    echo json_encode(['status' => 'success', 'scheduledAudios' => $scheduledAudios]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
