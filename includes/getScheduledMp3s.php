<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/path/to/php-error.log'); // Ensure the path to the log file is correct

header('Content-Type: application/json');

try {
    // Select entries that are NOT older than 14 days based on audio_scheduled_time_to_play
    $sql = "SELECT id, audio_url, audio_scheduled_time_to_play, audio_title_user_uploaded, 
            audio_description, audio_logo_url, video_url, video_title, video_description, 
            video_logo_url 
            FROM audios 
            WHERE audio_scheduled_time_to_play >= NOW() - INTERVAL 14 DAY 
            ORDER BY audio_scheduled_time_to_play ASC";

    $result = mysqli_query($conn, $sql);

    if ($result) {
        $mp3s = [];
        while ($row = mysqli_fetch_assoc($result)) {
            // Ensure null values are handled
            foreach ($row as $key => $value) {
                $row[$key] = $value ? $value : null;
            }
            $mp3s[] = $row;
        }
        echo json_encode(['status' => 'success', 'mp3s' => $mp3s]);
    } else {
        throw new Exception("Database query error: " . mysqli_error($conn));
    }
} catch (Exception $e) {
    error_log('PHP Error: ' . $e->getMessage()); // Log the error message to the error log file
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
