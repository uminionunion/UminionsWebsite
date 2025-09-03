<?php
include "db.Conn.Ver01.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $videoId = intval($_POST['videoId']);

    // Prepare and bind
    $stmt = $conn->prepare("UPDATE audios SET video_played = video_played + 1 WHERE id = ?");
    $stmt->bind_param("i", $videoId);

    if ($stmt->execute()) {
        echo "Record updated successfully";
    } else {
        echo "Error updating record: " . $stmt->error;
    }

    $stmt->close();
} else {
    echo "Invalid request method.";
}

$conn->close();
?>
