<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require 'db.Conn.Ver01.php';
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

$response = ['status' => 'error', 'message' => 'Invalid request'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $audioId = $_POST['audio_id'] ?? '';
    $userId = $_SESSION['id'] ?? null;

    if (!$userId) {
        http_response_code(401);
        $response['message'] = 'Log in to vote';
    } elseif ($audioId) {
        $conn->begin_transaction();
        try {
            $conn->query("CREATE TABLE IF NOT EXISTS AudioUserVotes (audio_id INT NOT NULL, user_id INT NOT NULL, vote_type TINYINT NOT NULL, PRIMARY KEY (audio_id, user_id))");
            $existing = $conn->prepare("SELECT vote_type FROM AudioUserVotes WHERE audio_id = ? AND user_id = ?");
            $existing->bind_param('ii', $audioId, $userId);
            $existing->execute();
            $vote = $existing->get_result()->fetch_assoc();
            $existing->close();

            if ($vote && (int)$vote['vote_type'] === 1) {
                $change = $conn->prepare("DELETE FROM AudioUserVotes WHERE audio_id = ? AND user_id = ?");
                $change->bind_param('ii', $audioId, $userId);
            } elseif ($vote) {
                $change = $conn->prepare("UPDATE AudioUserVotes SET vote_type = 1 WHERE audio_id = ? AND user_id = ?");
                $change->bind_param('ii', $audioId, $userId);
            } else {
                $change = $conn->prepare("INSERT INTO AudioUserVotes (audio_id, user_id, vote_type) VALUES (?, ?, 1)");
                $change->bind_param('ii', $audioId, $userId);
            }
            $change->execute();
            $change->close();
            $totals = $conn->prepare("UPDATE audios SET Upvote_Column = (SELECT COUNT(*) FROM AudioUserVotes WHERE audio_id = ? AND vote_type = 1), Downvote_Column = (SELECT COUNT(*) FROM AudioUserVotes WHERE audio_id = ? AND vote_type = -1), Totalvotes_Column = (SELECT COALESCE(SUM(vote_type), 0) FROM AudioUserVotes WHERE audio_id = ?) WHERE id = ?");
            $totals->bind_param('iiii', $audioId, $audioId, $audioId, $audioId);
            $totals->execute();
            $totals->close();
            $conn->commit();
            $response = ['status' => 'success', 'message' => 'Upvote updated'];
        } catch (Throwable $error) {
            $conn->rollback();
            $response['message'] = $error->getMessage();
        }
    } else {
        $response['message'] = 'Missing audio ID';
    }
}

echo json_encode($response);
$conn->close();
?>
