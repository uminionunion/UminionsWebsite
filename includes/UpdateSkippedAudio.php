<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Check if the audio_id and skipped parameters are set
if (isset($_POST['audio_id']) && isset($_POST['skipped'])) {
    $audio_id = $_POST['audio_id'];
    $skipped = $_POST['skipped'];

    // Update the skipped status in the database
    $sql = "UPDATE audios SET skipped = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $skipped, $audio_id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Audio skipped status updated successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update audio skipped status: ' . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request parameters']);
}

$conn->close();
?>
