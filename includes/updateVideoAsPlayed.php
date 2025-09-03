<?php
include "db.Conn.Ver01.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];

$sql = "UPDATE audios SET video_played = 1 WHERE id = $id";
if ($conn->query($sql) === TRUE) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
$conn->close();
?>
