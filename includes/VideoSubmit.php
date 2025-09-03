<?php
include "db.Conn.Ver01.php";

header('Content-Type: application/json');

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
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

    if (!is_dir($folderPath)) {
        mkdir($folderPath, 0777, true);
    }

    return $folderPath;
}

function handleLogoUpload($fileInputName, $uploadDir) {
    $logoUrl = '';
    if (isset($_FILES[$fileInputName]) && $_FILES[$fileInputName]['error'] === 0) {
        $logoName = $_FILES[$fileInputName]['name'];
        $logoTmpName = $_FILES[$fileInputName]['tmp_name'];
        $logoEx = pathinfo($logoName, PATHINFO_EXTENSION);
        $logoExLc = strtolower($logoEx);

        $allowedLogoExs = array('jpg', 'jpeg', 'png', 'gif');

        if (in_array($logoExLc, $allowedLogoExs)) {
            $newLogoName = uniqid("logo-", true) . '.' . $logoExLc;
            $logoUploadPath = $uploadDir . '/' . $newLogoName;
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            if (move_uploaded_file($logoTmpName, $logoUploadPath)) {
                $logoUrl = $logoUploadPath;
                error_log("Logo file successfully moved to $logoUploadPath");
            } else {
                error_log("Logo upload error: Unable to move file from $logoTmpName to $logoUploadPath");
            }
        } else {
            error_log("Invalid logo file type: $logoExLc");
        }
    }
    return $logoUrl;
}

try {
    if (isset($_POST['scheduledTime']) && isset($_FILES['videoFile']) && isset($_POST['videoTitle']) && isset($_POST['videoDescription']) && isset($_POST['videoOrders'])) {
        // Retrieve and sanitize form data
        $scheduledTime = htmlspecialchars($_POST['scheduledTime'], ENT_QUOTES, 'UTF-8');
        $videoTitle = htmlspecialchars($_POST['videoTitle'], ENT_QUOTES, 'UTF-8');
        $videoDescription = htmlspecialchars($_POST['videoDescription'], ENT_QUOTES, 'UTF-8');
        $videoOrders = json_decode($_POST['videoOrders'], true);
        $secondaryTitle1 = htmlspecialchars($_POST['secondaryTitle1'], ENT_QUOTES, 'UTF-8');
        $secondaryDescription1 = htmlspecialchars($_POST['secondaryDescription1'], ENT_QUOTES, 'UTF-8');
        $secondaryTitle2 = htmlspecialchars($_POST['secondaryTitle2'], ENT_QUOTES, 'UTF-8');
        $secondaryDescription2 = htmlspecialchars($_POST['secondaryDescription2'], ENT_QUOTES, 'UTF-8');

        error_log("Scheduled Time: $scheduledTime");
        error_log("Video Title: $videoTitle");
        error_log("Video Description: $videoDescription");
        error_log("Video Orders: " . json_encode($videoOrders));

        $scheduledTime = str_replace('T', ' ', $scheduledTime) . ':00';

        $videoFile = $_FILES['videoFile'];
        $videoName = $videoFile['name'];
        $tmpName = $videoFile['tmp_name'];
        $error = $videoFile['error'];

        error_log("Video File: $videoName, Temporary Path: $tmpName, Error: $error");

        if ($error === 0) {
            $videoEx = pathinfo($videoName, PATHINFO_EXTENSION);
            $videoExLc = strtolower($videoEx);

            $allowedExs = array("mp4", "webm", "ogg");

            if (in_array($videoExLc, $allowedExs)) {
                $fileCountQuery = $conn->query("SELECT COUNT(*) FROM audios");
                if ($fileCountQuery) {
                    $fileCountResult = $fileCountQuery->fetch_array();
                    $fileCount = $fileCountResult[0];
                    $folderPath = getFolderPath($fileCount);

                    $newVideoName = uniqid("video-", true) . '.' . $videoExLc;
                    $videoUploadPath = $folderPath . '/' . $newVideoName;
                    error_log("Attempting to move file from $tmpName to $videoUploadPath");
                    if (move_uploaded_file($tmpName, $videoUploadPath)) {
                        error_log("File successfully moved to $videoUploadPath");

                        $mp4VideoPath = $videoUploadPath;
                        if ($videoExLc === 'webm') {
                            $mp4VideoName = uniqid("video-", true) . '.mp4';
                            $mp4VideoPath = $folderPath . '/' . $mp4VideoName;
                            $ffmpegCmd = "ffmpeg -i " . escapeshellarg($videoUploadPath) . " -c:v libx264 -crf 23 -preset veryfast -c:a aac -b:a 192k " . escapeshellarg($mp4VideoPath);
                            exec($ffmpegCmd . " 2>&1", $output, $returnVar);
                            error_log("FFmpeg command: $ffmpegCmd");
                            error_log("FFmpeg output: " . implode("\n", $output));
                            if ($returnVar !== 0) {
                                error_log("FFmpeg conversion error: " . implode("\n", $output));
                                echo json_encode(['status' => 'error', 'message' => 'Video conversion error']);
                                exit();
                            }
                        }

                        $checkboxTwoVideoUploadPath = '';
                        $checkboxTwoVideoUploadPathMp4 = '';
                        if (isset($_FILES['videoFile2'])) {
                            $videoFile2 = $_FILES['videoFile2'];
                            $videoName2 = $videoFile2['name'];
                            $tmpName2 = $videoFile2['tmp_name'];
                            $error2 = $videoFile2['error'];

                            error_log("Second Video File: $videoName2, Temporary Path: $tmpName2, Error: $error2");

                            if ($error2 === 0) {
                                $videoEx2 = pathinfo($videoName2, PATHINFO_EXTENSION);
                                $videoExLc2 = strtolower($videoEx2);

                                if (in_array($videoExLc2, $allowedExs)) {
                                    $newVideoName2 = uniqid("video2-", true) . '.' . $videoExLc2;
                                    $checkboxTwoVideoUploadPath = $folderPath . '/' . $newVideoName2;
                                    error_log("Attempting to move file from $tmpName2 to $checkboxTwoVideoUploadPath");
                                    if (move_uploaded_file($tmpName2, $checkboxTwoVideoUploadPath)) {
                                        error_log("File successfully moved to $checkboxTwoVideoUploadPath");

                                        $mp4VideoPath2 = $checkboxTwoVideoUploadPath;
                                        if ($videoExLc2 === 'webm') {
                                            $mp4VideoName2 = uniqid("video2-", true) . '.mp4';
                                            $mp4VideoPath2 = $folderPath . '/' . $mp4VideoName2;
                                            $ffmpegCmd2 = "ffmpeg -i " . escapeshellarg($checkboxTwoVideoUploadPath) . " -c:v libx264 -crf 23 -preset veryfast -c:a aac -b:a 192k " . escapeshellarg($mp4VideoPath2);
                                            exec($ffmpegCmd2 . " 2>&1", $output2, $returnVar2);
                                            error_log("FFmpeg command: $ffmpegCmd2");
                                            error_log("FFmpeg output: " . implode("\n", $output2));
                                            if ($returnVar2 !== 0) {
                                                error_log("FFmpeg conversion error: " . implode("\n", $output2));
                                                echo json_encode(['status' => 'error', 'message' => 'Video conversion error']);
                                                exit();
                                            }
                                            $checkboxTwoVideoUploadPathMp4 = $mp4VideoPath2;
                                        }
                                    }
                                }
                            }
                        }
                        // Close all if blocks related to video file uploads.
                    } else {
                        error_log("File upload error: $error");
                        $em = "There was an error uploading the file";
                        echo json_encode(['status' => 'error', 'message' => $em]);
                        exit();
                    }
                } else {
                    error_log("Error querying file count: " . mysqli_error($conn));
                    echo json_encode(['status' => 'error', 'message' => "Error querying file count"]);
                    exit();
                }
            } else {
                $em = "You can't upload files of this type";
                error_log("Invalid video file type: $videoExLc");
                echo json_encode(['status' => 'error', 'message' => $em]);
                exit();
            }
        } else {
            error_log("Form not submitted or file not uploaded correctly");
            echo json_encode(['status' => 'error', 'message' => 'Form not submitted or file not uploaded']);
            exit();
        }
        
        // Process logo file
        $logoUrl = '';
        if (isset($_FILES['logoFile']) && $_FILES['logoFile']['error'] === 0) {
            $logoName = $_FILES['logoFile']['name'];
            $logoTmpName = $_FILES['logoFile']['tmp_name'];
            $logoEx = pathinfo($logoName, PATHINFO_EXTENSION);
            $logoExLc = strtolower($logoEx);
    
            $allowedLogoExs = array('jpg', 'jpeg', 'png', 'gif');
    
            if (in_array($logoExLc, $allowedLogoExs)) {
                $newLogoName = uniqid("logo-", true) . '.' . $logoExLc;
                $logoUploadPath = $folderPath . '/' . $newLogoName;
                if (!move_uploaded_file($logoTmpName, $logoUploadPath)) {
                    error_log("Logo upload error: Unable to move file from $logoTmpName to $logoUploadPath");
                    echo json_encode(['status' => 'error', 'message' => 'Logo upload error']);
                    exit();
                }
                $logoUrl = $folderPath . '/' . $newLogoName;
                $logoUrlRelative = str_replace("../uploads/", "", $logoUrl);
                error_log("Logo file successfully moved to $logoUploadPath");
            } else {
                error_log("Invalid logo file type: $logoExLc");
                echo json_encode(['status' => 'error', 'message' => "You can't upload logo files of this type"]);
                exit();
            }
        }

        // Insert file paths and additional data into database
        // Store MP4 path in video_url field
        $videoUploadPathRelative = str_replace("../uploads/", "", $videoUploadPath);
        $mp4VideoPathRelative = str_replace("../uploads/", "", $mp4VideoPath);
        $checkboxTwoVideoUploadPathRelative = str_replace("../uploads/", "", $checkboxTwoVideoUploadPath);
        $checkboxTwoVideoUploadPathMp4Relative = str_replace("../uploads/", "", $checkboxTwoVideoUploadPathMp4);
        $logoUrlRelative = str_replace("../uploads/", "", $logoUrl);

        // Log relative paths before inserting to database
        error_log("Relative Paths: Video - $videoUploadPathRelative, MP4 - $mp4VideoPathRelative, Checkbox Two WebM - $checkboxTwoVideoUploadPathRelative, Checkbox Two MP4 - $checkboxTwoVideoUploadPathMp4Relative");

        // Process secondary logos
        $secondaryLogo1 = handleLogoUpload('secondaryLogo1', '../URTesting001/uploadsSecondary');
        $secondaryLogo2 = handleLogoUpload('secondaryLogo2', '../URTesting001/uploadsSecondary');

        // Process secondary inputs if provided
        $secondaryTitle1 = isset($_POST['secondaryTitle1']) ? $_POST['secondaryTitle1'] : '';
        $secondaryDescription1 = isset($_POST['secondaryDescription1']) ? $_POST['secondaryDescription1'] : '';
        $secondaryTitle2 = isset($_POST['secondaryTitle2']) ? $_POST['secondaryTitle2'] : '';
        $secondaryDescription2 = isset($_POST['secondaryDescription2']) ? $_POST['secondaryDescription2'] : '';

        // Update the SQL query to include secondary inputs
        // Prepare SQL statement to insert data into the database
        $stmt = $conn->prepare("INSERT INTO audios (
            audio_url,
            video_url,
            video_title,
            video_description,
            audio_scheduled_time_to_play,
            video_logo_url,
            video_played,
            Upvote_Column,
            Downvote_Column,
            Totalvotes_Column,
            skipped,
            undesired_video,
            checkbox_two_video_url_webm,
            checkbox_two_video_url_mp4,
            video_orders,
            checkbox_one_video_title,
            checkbox_one_video_description,
            checkbox_one_video_logo_url,
            checkbox_two_video_title,
            checkbox_two_video_description,
            checkbox_two_video_logo_url
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        // Store JSON-encoded video orders in a variable
        $videoOrdersJson = json_encode($videoOrders);

        // Corrected bind_param to include the JSON-encoded videoOrders
        $stmt->bind_param(
            "sssssssssssssss",
            $videoUploadPathRelative,
            $mp4VideoPathRelative,
            $videoTitle,
            $videoDescription,
            $scheduledTime,
            $logoUrlRelative,
            $checkboxTwoVideoUploadPathRelative,
            $checkboxTwoVideoUploadPathMp4Relative,
            $videoOrdersJson,
            $secondaryTitle1,
            $secondaryDescription1,
            $secondaryLogo1,
            $secondaryTitle2,
            $secondaryDescription2,
            $secondaryLogo2
        );

        if ($stmt->execute()) {
            $last_id = $stmt->insert_id;
            echo json_encode([
                'status' => 'success',
                'message' => 'File uploaded, converted, and database updated successfully',
                'video_id' => $last_id,
                'audio_url' => $videoUploadPathRelative,
                'video_url' => $mp4VideoPathRelative,
                'checkbox_two_video_url_webm' => $checkboxTwoVideoUploadPathRelative,
                'checkbox_two_video_url_mp4' => $checkboxTwoVideoUploadPathMp4Relative,
                'logo_url' => $logoUrlRelative,
                'videoTitle' => $videoTitle,
                'videoDescription' => $videoDescription,
                'videoOrders' => $videoOrders
            ]);
            exit();
        } else {
            $em = "Database upload error: " . $stmt->error;
            error_log("Database error: $em");
            echo json_encode(['status' => 'error', 'message' => "Error: $em"]);
            exit();
        }

    } else {
        error_log("Form not submitted or file not uploaded correctly");
        echo json_encode(['status' => 'error', 'message' => 'Form not submitted or file not uploaded']);
        exit();
    }

} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit();
}

$conn->close();
?>
