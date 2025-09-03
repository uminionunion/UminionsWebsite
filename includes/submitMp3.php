<?php
// Include your database connection
include "db.Conn.Ver01.php";

// Enable error logging but disable error display
ini_set('log_errors', 1);
ini_set('display_errors', 0);
error_reporting(E_ALL);

function getFolderNumber($count) {
    return intdiv($count, 10) + 1;
}

function getFolderPath($count) {
    $level1 = getFolderNumber($count);
    $level2 = getFolderNumber($level1 - 1);
    $level3 = getFolderNumber($level2 - 1);
    $level4 = getFolderNumber($level3 - 1);

    $folderPath = "../uploads";
    if ($level4 > 1) $folderPath .= "/Folder 1000-$level4";
    if ($level3 > 1) $folderPath .= "/Folder 100-$level3";
    if ($level2 > 1) $folderPath .= "/Folder 10-$level2";
    $folderPath .= "/Folder $level1";

    // Ensure the directory exists before returning it
    if (!is_dir($folderPath)) {
        mkdir($folderPath, 0777, true);
    }

    return $folderPath;
}

try {
    if (isset($_POST['mp3Time']) && (isset($_FILES['my_audio']) || isset($_FILES['recordedAudio']))) {
        $mp3Time = htmlspecialchars($_POST['mp3Time'], ENT_QUOTES, 'UTF-8');
        $mp3Title = htmlspecialchars($_POST['mp3Title'], ENT_QUOTES, 'UTF-8');
        $mp3Description = htmlspecialchars($_POST['mp3Description'], ENT_QUOTES, 'UTF-8');
        $audioRecorded = isset($_POST['audioRecorded']) ? 1 : 0;

        $audioFileKey = isset($_FILES['my_audio']) ? 'my_audio' : 'recordedAudio';
        $audio_name = $_FILES[$audioFileKey]['name'];
        $tmp_name = $_FILES[$audioFileKey]['tmp_name'];
        $error = $_FILES[$audioFileKey]['error'];

        if ($error === 0) {
            $audio_ex = pathinfo($audio_name, PATHINFO_EXTENSION);
            $audio_ex_lc = strtolower($audio_ex);

            $allowed_exs = array("3gp", 'mp3', 'wav', 'ogg', 'mpeg', 'recorded_audio.mp3', 'audio/mpeg', 'flac', 'aac', 'aiff', 'wma', 'm4a');

            if (in_array($audio_ex_lc, $allowed_exs)) {
                $fileCountQuery = $conn->query("SELECT COUNT(*) FROM audios");
                $fileCountResult = $fileCountQuery->fetch_array();
                $fileCount = $fileCountResult[0];
                $folderPath = "../URTesting001/uploads";

                // Ensure the upload directory exists
                if (!is_dir($folderPath)) {
                    mkdir($folderPath, 0777, true);
                }

                $new_audio_name = uniqid("audio-", true) . '.' . $audio_ex_lc;
                $audio_upload_path = $folderPath . '/' . $new_audio_name;

                if (move_uploaded_file($tmp_name, $audio_upload_path)) {
                    $logo_url = '';
                    if (isset($_FILES['logoInput']) && $_FILES['logoInput']['error'] === 0) {
                        $logo_name = $_FILES['logoInput']['name'];
                        $logo_tmp_name = $_FILES['logoInput']['tmp_name'];
                        $logo_ex = pathinfo($logo_name, PATHINFO_EXTENSION);
                        $logo_ex_lc = strtolower($logo_ex);

                        $allowed_logo_exs = array('jpg', 'jpeg', 'png', 'gif');

                        if (in_array($logo_ex_lc, $allowed_logo_exs)) {
                            $new_logo_name = uniqid("logo-", true) . '.' . $logo_ex_lc;
                            $logo_upload_path = $folderPath . '/' . $new_logo_name;

                            if (move_uploaded_file($logo_tmp_name, $logo_upload_path)) {
                                $logo_url = $folderPath . '/' . $new_logo_name;
                            } else {
                                echo json_encode(['status' => 'error', 'message' => 'Logo upload error']);
                                exit();
                            }
                        } else {
                            echo json_encode(['status' => 'error', 'message' => "You can't upload logo files of this type"]);
                            exit();
                        }
                    }

                    $stmt = $conn->prepare("INSERT INTO audios (audio_url, audio_scheduled_time_to_play, audio_title_user_uploaded, audio_description, audio_logo_url, audio_recorded) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->bind_param("sssssi", $audio_upload_path, $mp3Time, $mp3Title, $mp3Description, $logo_url, $audioRecorded);

                    if ($stmt->execute()) {
                        $last_id = $stmt->insert_id;
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'File uploaded and database updated successfully',
                            'audio_id' => $last_id,
                            'audio_url' => $audio_upload_path,
                            'logo_url' => $logo_url,
                            'mp3Title' => $mp3Title,
                            'mp3Description' => $mp3Description
                        ]);
                        exit();
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Database upload error: ' . $stmt->error]);
                        exit();
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'File upload error']);
                    exit();
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => "You can't upload files of this type"]);
                exit();
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => "There was an error uploading the file"]);
            exit();
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Form not submitted or file not uploaded']);
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit();
}

$conn->close();
?>
