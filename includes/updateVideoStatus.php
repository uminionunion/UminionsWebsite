<?php
include "db.Conn.Ver01.php";

// Get the JSON input
$data = json_decode(file_get_contents('php://input'), true);
$videoId = $data['id'];

// Update the video_played field in the database
$sql = "UPDATE audios SET video_played = 1 WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $videoId);

$response = [];
if ($stmt->execute()) {
    $response['status'] = 'success';
} else {
    $response['status'] = 'error';
    $response['message'] = $stmt->error;
}

echo json_encode($response);

$stmt->close();
$conn->close();
?>
