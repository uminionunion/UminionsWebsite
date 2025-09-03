<?php
require 'db.Conn.Ver01.php';
$_SESSION = [];
session_unset();
session_destroy();
header("Location: /URTesting001/MergeThisVersion010.03.php"); // <<<Okay, this is funky. to "go back" a page, its a backslash. but when i do one, it skips my whole folder. so when logging out, double check this be working then