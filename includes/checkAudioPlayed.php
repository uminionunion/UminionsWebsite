<?php
header('Content-Type: application/json');

// Include your database connection
include "db.Conn.Ver01.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $audio_id = $data['audio_id'];

    $stmt = $conn->prepare("SELECT Played_Already FROM audios WHERE id = ?");
    $stmt->bind_param("i", $audio_id);
    $stmt->execute();
    $stmt->bind_result($played_already);
    $stmt->fetch();
    $stmt->close();
    $conn->close();

    echo json_encode(['played_already' => $played_already]);
}
?>
