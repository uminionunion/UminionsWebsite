<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1); // Set to 1 for development, 0 for production
ini_set('log_errors', 1);
ini_set('error_log', '/path/to/php-error.log'); // Ensure the path to the log file is correct

function logError($message) {
    error_log($message, 3, "/path/to/php-error.log"); // Ensure the path to error log is correct
}

try {
    if (isset($_FILES['recordedAudio']) || isset($_POST['mp3Time']) || isset($_POST['mp3Title']) || isset($_POST['mp3Description'])) {
        $mp3Time = $_POST['mp3Time'] ?? null;
        $mp3Title = $_POST['mp3Title'] ?? null;
        $mp3Description = $_POST['mp3Description'] ?? null;

        // Handle audio file upload
        if (isset($_FILES['recordedAudio'])) {
            $audio_name = $_FILES['recordedAudio']['name'];
            $tmp_name = $_FILES['recordedAudio']['tmp_name'];
            $audio_ex = pathinfo($audio_name, PATHINFO_EXTENSION);
            $audio_ex_lc = strtolower($audio_ex);

            $allowed_exs = array('mp3', 'wav', 'ogg', 'mpeg', 'recorded_audio.mp3', 'audio/mpeg', 'flac', 'aac', 'aiff', 'wma', 'm4a');
            if (in_array($audio_ex_lc, $allowed_exs)) {
                $new_audio_name = uniqid("audio-", true) . '.' . $audio_ex_lc;
                $audio_upload_path = '../uploads/' . $new_audio_name;
                if (!move_uploaded_file($tmp_name, $audio_upload_path)) {
                    throw new Exception("Failed to move uploaded file to $audio_upload_path");
                }
            } else {
                throw new Exception("Invalid file type $audio_ex_lc");
            }
        }

        // Handle logo file upload
        if (isset($_FILES['logoFile']) && $_FILES['logoFile']['error'] === 0) {
            $logo_name = $_FILES['logoFile']['name'];
            $logo_tmp_name = $_FILES['logoFile']['tmp_name'];
            $logo_ex = pathinfo($logo_name, PATHINFO_EXTENSION);
            $logo_ex_lc = strtolower($logo_ex);

            $allowed_logo_exs = array('jpg', 'jpeg', 'png', 'gif');
            if (in_array($logo_ex_lc, $allowed_logo_exs)) {
                $new_logo_name = uniqid("logo-", true) . '.' . $logo_ex_lc;
                $logo_upload_path = '../uploads/' . $new_logo_name;
                if (!move_uploaded_file($logo_tmp_name, $logo_upload_path)) {
                    throw new Exception("Failed to move uploaded file to $logo_upload_path");
                }
            } else {
                throw new Exception("Invalid file type $logo_ex_lc");
            }
        } else {
            $new_logo_name = '';
        }

        // Insert file path and additional data into database
        $sql = "INSERT INTO audios (audio_url, audio_scheduled_time_to_play, audio_title_user_uploaded, audio_description, audio_logo_url)
                VALUES ('$new_audio_name', '$mp3Time', '$mp3Title', '$mp3Description', '$new_logo_name')";
        if (mysqli_query($conn, $sql)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'File uploaded and database updated successfully',
                'audio_url' => $new_audio_name,
                'mp3Title' => $mp3Title,
                'mp3Description' => $mp3Description,
                'audio_scheduled_time_to_play' => $mp3Time,
                'logo_url' => $new_logo_name
            ]);
        } else {
            throw new Exception("Database upload error: " . mysqli_error($conn));
        }
    } else {
        $missing_data = [];
        if (!isset($_FILES['recordedAudio'])) $missing_data[] = 'recordedAudio';
        if (!isset($_POST['mp3Time'])) $missing_data[] = 'mp3Time';
        if (!isset($_POST['mp3Title'])) $missing_data[] = 'mp3Title';
        if (!isset($_POST['mp3Description'])) $missing_data[] = 'mp3Description';
        throw new Exception("Invalid data provided: " . implode(', ', $missing_data));
    }
} catch (Exception $e) {
    logError($e->getMessage());
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
