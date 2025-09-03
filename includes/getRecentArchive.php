<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Fetch the 100 most recent audio entries from the database, ordered by the creation time (most recent first)
$sql = "SELECT id, audio_title_user_uploaded, audio_description, audio_logo_url, audio_url, audio_scheduled_time_to_play FROM audios ORDER BY id DESC LIMIT 100";
$result = $conn->query($sql);

$audioEntries = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $audioEntries[] = [
            'id' => $row['id'],
            'title' => $row['audio_title_user_uploaded'],
            'description' => $row['audio_description'],
            'logoUrl' => $row['audio_logo_url'],
            'audioUrl' => $row['audio_url'],
            'scheduledTime' => $row['audio_scheduled_time_to_play']
        ];
    }
    echo json_encode(['status' => 'success', 'audios' => $audioEntries]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No audio entries found']);
}

$conn->close();
?>
