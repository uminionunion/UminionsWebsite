<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Fetch videos scheduled to play in the future with .webm files
$sql = "SELECT id, audio_scheduled_time_to_play AS scheduledTime, audio_url, video_url, video_played, video_title, video_description 
        FROM audios 
        WHERE video_played = 0 AND audio_url LIKE '%.webm' 
        ORDER BY audio_scheduled_time_to_play ASC 
        LIMIT 25";

$result = $conn->query($sql);

if (!$result) {
    die(json_encode(["error" => "Error executing query: " . $conn->error]));
}

$videos = array();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $videos[] = $row;
    }
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($videos);

// Log the result for debugging
file_put_contents('php://stderr', print_r($videos, TRUE));
?>
