<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Check if the necessary data is provided
if (isset($_POST['audio_id']) && isset($_POST['start_time']) && isset($_POST['end_time']) && isset($_POST['length'])) {
    $audio_id = $_POST['audio_id'];
    $start_time = $_POST['start_time'];
    $end_time = $_POST['end_time'];
    $length = $_POST['length'];

    // Update the audio times in the database
    $sql = "UPDATE audios SET audio_time_length = ?, audio_time_actually_played = ?, audio_time_actually_ended = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $length, $start_time, $end_time, $audio_id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Audio times updated successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update audio times: ' . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request parameters']);
}

$conn->close();
?>
