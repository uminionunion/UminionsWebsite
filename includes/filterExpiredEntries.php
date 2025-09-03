<?php //this php file failed (cause my stuff is on timers and this didnt work). it was removed but it was part of "MergeThisVersion050.01"
include "db.Conn.Ver01.php";

// Fetch entries that are still within 14 days of their scheduled play date
$sql = "SELECT * FROM audios WHERE audio_scheduled_time_to_play >= NOW() - INTERVAL 14 DAY ORDER BY audio_scheduled_time_to_play ASC";
$result = $conn->query($sql);

$filteredEntries = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $filteredEntries[] = $row;
    }
}

// Return filtered entries in JSON format
echo json_encode($filteredEntries);

$conn->close();
?>
