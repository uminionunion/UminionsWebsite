<?php
header('Content-Type: application/json');

// Include your database connection
include "db.Conn.Ver01.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $audio_id = $data['audio_id'];
    $played_already = $data['played_already'];

    $stmt = $conn->prepare("UPDATE audios SET Played_Already = ? WHERE id = ?");
    $stmt->bind_param("ii", $played_already, $audio_id);
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Update failed']);
    }
    $stmt->close();
    $conn->close();
}
?>
