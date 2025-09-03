<?php
include "db.Conn.Ver01.php";

// Log the start of the script
error_log("getScheduledVideos.php: Script started");

// Fetch videos scheduled to play in the future with .webm files
$sql = "SELECT * FROM audios WHERE audio_scheduled_time_to_play > NOW() AND audio_url LIKE '%.webm' ORDER BY audio_scheduled_time_to_play ASC";
$result = $conn->query($sql);

$videos = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Log the retrieved row
        error_log("getScheduledVideos.php: Retrieved row - " . json_encode($row));

        // Ensure fields are appropriately handled even if empty
        $row['audio_url'] = !empty($row['audio_url']) ? "../uploads/" . $row['audio_url'] : null;
        $row['video_url'] = !empty($row['video_url']) ? "../uploads/" . $row['video_url'] : null;
        $row['checkbox_two_video_url_webm'] = !empty($row['checkbox_two_video_url_webm']) ? "../uploads/" . $row['checkbox_two_video_url_webm'] : null;
        $row['checkbox_two_video_url_mp4'] = !empty($row['checkbox_two_video_url_mp4']) ? "../uploads/" . $row['checkbox_two_video_url_mp4'] : null;
        $row['video_logo_url'] = !empty($row['video_logo_url']) ? "../uploads/" . $row['video_logo_url'] : null;

        // Include the videoOrders field in the output
        $row['video_orders'] = isset($row['video_orders']) ? $row['video_orders'] : json_encode([0, 1]);

        // Add to videos array
        $videos[] = $row;

        // Log the processed row
        error_log("getScheduledVideos.php: Processed row - " . json_encode($row));
    }
} else {
    error_log("getScheduledVideos.php: No rows found");
}

echo json_encode($videos);
$conn->close();

// Log the end of the script
error_log("getScheduledVideos.php: Script ended");
?>
