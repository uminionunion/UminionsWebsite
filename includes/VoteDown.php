<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require 'db.Conn.Ver01.php';

$response = ['status' => 'error', 'message' => 'Invalid request'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $audioId = $_POST['audio_id'] ?? '';
    $mediaType = $_POST['type'] ?? 'audio';

    if ($audioId) {
        $stmt = $conn->prepare("UPDATE audios SET Downvote_Column = Downvote_Column + 1 WHERE id = ?");
        if (!$stmt) {
            $response['message'] = 'Prepare failed: ' . $conn->error;
            echo json_encode($response);
            exit;
        }

        $stmt->bind_param('i', $audioId);

        if ($stmt->execute()) {
            $response['status'] = 'success';
            $response['message'] = 'Downvote recorded successfully';
        } else {
            $response['message'] = 'Execute failed: ' . $stmt->error;
        }

        $stmt->close();
    } else {
        $response['message'] = 'Missing audio ID';
    }
}

echo json_encode($response);
$conn->close();
?>
