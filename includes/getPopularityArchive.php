<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Fetch the most upvoted audio entries from the database, with Totalvotes_Column >= 5, ordered by Totalvotes_Column DESC
$sql = "SELECT id, audio_title_user_uploaded, audio_description, audio_logo_url, audio_url, audio_scheduled_time_to_play, audio_time_actually_played, audio_time_actually_ended, Totalvotes_Column FROM audios WHERE Totalvotes_Column >= 5 ORDER BY Totalvotes_Column DESC";
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
            'scheduledTime' => $row['audio_scheduled_time_to_play'],
            'actualPlayedTime' => $row['audio_time_actually_played'],
            'actualEndTime' => $row['audio_time_actually_ended'],
            'totalVotes' => $row['Totalvotes_Column']
        ];
    }
    echo json_encode(['status' => 'success', 'audios' => $audioEntries]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No audio entries found']);
}

$conn->close();
?>
