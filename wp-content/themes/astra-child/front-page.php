<?php
require 'includes/db.Conn.Ver01.php'; // This line of code includes the database connection script.

if(isset($_POST["submit1"])) { // Check if the registration form was submitted.
    $username = $_POST['username']; // Get the username from the submitted form.
    $email = $_POST['email']; // Get the email from the submitted form.
    $pwd = $_POST['pwd']; // Get the password from the submitted form.
    
    // Check if the username or email already exists in the database.
    $duplicate = mysqli_query($conn, "SELECT * FROM uminionradiowebsiteusers WHERE username_Uminion='$username' OR email_Uminion='$email'");
    if(mysqli_num_rows($duplicate) > 0) { // If a record exists with the same username or email.
        echo "<script>alert('Username or E-mail already exists');</script>"; // Show an alert message.
    } else {
        // Insert the new user's data into the database.
        $query = "INSERT INTO uminionradiowebsiteusers (username_Uminion, pwd_Uminion, email_Uminion) VALUES ('$username', '$pwd', '$email')";
        mysqli_query($conn, $query); // Execute the insertion query.
        
        // Start session and log in the user immediately after registration.
        $_SESSION["login"] = true; // Set the login session to true.
        
        // Fetch the user ID of the newly registered user.
        $result = mysqli_query($conn, "SELECT id_User_Uminion FROM uminionradiowebsiteusers WHERE username_Uminion='$username' OR email_Uminion='$email'");
        $row = mysqli_fetch_assoc($result); // Fetch the result as an associative array.
        $_SESSION["id"] = $row["id_User_Uminion"]; // Set the session ID to the user's ID.
        
        echo "<script>alert('Registration successful');</script>"; // Show a success message.
        header("Location: MergeThisVersion031.01.03.03.02.php"); // Redirect to a specified page.
        exit(); // Ensure no further code is executed.
    }
}

if(isset($_POST["submit2"])) { // Check if the login form was submitted.
    $usernameemail = $_POST["usernameemail"]; // Get the username or email from the submitted form.
    $password = $_POST["pwd"]; // Get the password from the submitted form.
    
    // Fetch the user's data from the database using the provided username or email.
    $result = mysqli_query($conn, "SELECT * FROM uminionradiowebsiteusers WHERE username_Uminion='$usernameemail' OR email_Uminion='$usernameemail'");
    $row = mysqli_fetch_assoc($result); // Fetch the result as an associative array.
    
    if(mysqli_num_rows($result) > 0) { // If a user record exists with the provided username or email.
        if($password == $row["pwd_Uminion"]) { // If the provided password matches the stored password.
            $_SESSION["login"] = true; // Set the login session to true.
            $_SESSION["id"] = $row["id_User_Uminion"]; // Set the session ID to the user's ID.
            header("Location: MergeThisVersion031.01.03.03.02.php"); // Redirect to a specified page.
        } else {
            echo "<script>alert('Wrong Password');</script>"; // Show an alert message for wrong password.
        }
    } else {
        echo "<script>alert('User not Registered');</script>"; // Show an alert message if the user is not registered.
    }
}

 //Plug in when ready:>>>       if(!empty($_SESSION["id"])) { // Check if the session ID is set (user is logged in).
 //Plug in when ready:>>>           $id = $_SESSION["id"]; // Get the session ID.
    
    // Fetch the user's data from the database using the session ID.
 //Plug in when ready:>>>           $result = mysqli_query($conn, "SELECT * FROM uminionradiowebsiteusers WHERE id_User_Uminion=$id");
 //Plug in when ready:>>>           $row = mysqli_fetch_assoc($result); // Fetch the result as an associative array.
 //Plug in when ready:>>>       } else { // If the user is not logged in.
 //Plug in when ready:>>>           if (!isset($_SESSION['redirected'])) { // Check if the user has not been redirected already.
 //Plug in when ready:>>>               $_SESSION['redirected'] = true; // Mark that the user has been redirected.
 //Plug in when ready:>>>               header("Location: MergeThisVersion031.01.03.03.02.php"); // Redirect to a specified page.
 //Plug in when ready:>>>               exit(); // Ensure no further code is executed.
 //Plug in when ready:>>>           }
//Plug in when ready:>>>        }

?>



<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        <title>Uminion Radio</title>
        <style>
			
			
/* This code here, is part of CELLPHONECODEXXXPart001of003 revolves around: "What should happen, when the screen goes from desktop to cellphone." (if you change width, change for all CELLPHONECODEXXXPartXofY please) */
  
  @media (max-width: 775px) {
    /* Moves #headerRightContainerPre000 and the image inside it 600px to the right */
    #headerRightContainerPre000 {
      position: relative; /* Ensures the element is positioned relative to its normal flow */
      left: 500px; /* Moves the container to the right */
    }
    #headerRightContainerPre000 img {
      position: relative; /* Ensures the image is also positioned relative to its normal flow */
      left: 500px; /* Moves the image to the right */
    }

    /* Moves the Banner001 image 500px to the right */
    #BannerAtTopOfPage {
      position: relative; /* Ensures the image is positioned relative to its normal flow */
      left: 525px; /* Moves the image to the right */
    }

    /* Moves the Banner002 image 500px to the right */
    #BannerAtBottomOfPage {
      position: relative; /* Ensures the image is positioned relative to its normal flow */
      left: 525px; /* Moves the image to the right */
    }

    /* Adjusts the min-height for containerForTopLeftSection DO I NEED THIS? SO FAR LOOKS LIKE MAYBE NO, CAUSE WHEN I DID NEED IT (when my cellphone viewport didnt look right) IT WAS ADDED IN. BUT NOW (that my cellphone viewport, DOES, look right;) I MIGHT NOT NEED THIS NO MORE:>>>>>>>>
    .containerForTopLeftSection {
      min-height: 750px; 
    } <<<<<<<<<<<*/

    /* Moves the div.scene0000002 200px to the right */
    .scene0000002 {
      position: relative; /* Ensures the element is positioned relative to its normal flow */
      left: 400px; /* Moves the element to the right */
    }
	  
	  .header-left-bottom-container img{
      position: relative;
	top: -225px;
    } 

    /* Moves collectionOfNowPlayingComingUpNextAndRecentlyPlayedSection 500px to the right */
    .collectionOfNowPlayingComingUpNextAndRecentlyPlayedSection {
      position: relative; /* Ensures the element is positioned relative to its normal flow */
      left: 950px; /* Moves the container to the right */
    }

	  /* Moves the #mp3Details div 200px down */
    #mp3Details {
      position: relative; /* Ensures the element is positioned relative to its normal flow */
      top: 200px; /* Moves the element 200px down */
    }
	  
  } /* <<<< closing bracket for @Media (the cellphone/smartphone one)*/


   

	
			
			
			
            body {
                font-family: Arial, sans-serif;
                background-color: #000000; /* Dark mode background */
                color: #FFFFFF; /* White font color */
				min-width: 1275px;
				overflow-x: auto;
            }
			
            .header-container {
                display: flex;
                justify-content: space-between; /* <<<<<<<<<<<<<<<<<<<< do i want this? Flex row layout */
                padding: 10px;
                background-color: #333333; /* Darker background for header */
                border-bottom: 2px solid #ccc;
				min-width: 1275px;
				overflow-x: auto;
            }

            .header-left-top-container {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .header-left-container h1 { /*Note to self: CTRL+F "header-left-container" and you'll notice TWO CSSs of this. so, careful o that */
                margin: 0;
                background: linear-gradient(60deg, hsl(202deg 100% 75%), hsl(205deg 100% 64%), hsl(230deg 100% 75%), hsl(270deg 100% 72%));
                -webkit-background-clip: text;
                color: transparent;
            }

            .header-center-container button, 
            .extra-content-container button {
                margin: 5px;
                padding: 10px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                background-color: #ff9800; /* Matching colors for all buttons (orange)*/
                color: white;
            }

            


                /* General button styling for consistency */
                .button-style {
                    background-color: #4CAF50; /* Green background */
                    color: white; /* White text */
                    padding: 10px 20px; /* Padding */
                    border: none; /* No border */
                    border-radius: 5px; /* Rounded corners */
                    cursor: pointer; /* Pointer cursor on hover */
                    text-align: center;
                    display: inline-block;
                    font-size: 16px;
                }

                .button-style:hover {
                    background-color: #45a049; /* Darker green on hover */
                }


          





            .header-center-container div {
                display: none; /* Initially hidden */
                margin-top: 10px;
            }

            /* Override for SignUpAndLoginContainer */
            .header-center-container .SignUpAndLoginContainer {
                display: block; /* Ensure this container is always visible */
            }

            .header-right-container {
                display: flex;
                flex-direction: column;
            }

                .header-right-container div {
                    margin: 5px 0;
                }

                .header-right-container h2 {
                    background: linear-gradient(10deg, #f7ec9c, #ff8651);
                    -webkit-background-clip: text;
                    color: transparent;
                }

                .header-right-container h3 {
                    background: linear-gradient(70deg, #c51574, #97389b);
                    -webkit-background-clip: text;
                    color: transparent;
                }

            .body-container {
                padding: 20px;
            }

            .schedule-container {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 10px;
                margin-top: 20px;
            }

                .schedule-container div {
                    padding: 10px;
                    border: 1px solid #ccc;
                    text-align: center;
                    background-color: #1a1a1a; /* Darker background for schedule entries */
                    color: white;
                    overflow-y: auto; /* Enable scrolling */
                    position: relative; /* Ensure positioning context */
                    display: flex; /* Flexbox for alignment */
                    flex-direction: column; /* Column direction to keep order of elements */
                    max-height: 250px; /* Set a max-height for the calendar entries */
                }

                .schedule-container p,
                .schedule-container img,
                .schedule-container audio {
                    margin: 5px 0; /* Space out elements */
                }

                .schedule-container img {
                    max-width: 100%;
                    max-height: 150px; /* Limit the image size */
                    /* vertical-align: middle; <<<<<<<<<<<<<<<<<<commented this out. is that okay? */
                    display: contain; /* Ensure images take full width */
                }

            .current-day {
                background: linear-gradient(10deg, #f7ec9c, #ff8651);
                -webkit-background-clip: text;
                
                color: transparent;
            }

            /*>>>>>>>>>>>>>>>>>> turned this color off; but this is the thang to modify to change future colors:>>>>>>>>>>>>>>>>> .past-day { background: linear-gradient(10deg, #02ce85, #02ceab); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: transparent; } <<<<<<<<<<<<<<<<<<< */

            /*>>>>>>>>>>>>>>>>>> turned this color off; but this is the thang to modify to change future colors:>>>>>>>>>>>>>>>>> .future-day { background: linear-gradient(70deg, #c51574, #97389b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: transparent; } <<<<<<<<<<<<<<<<<<< */

            .footer-container {
                display: flex;
                
                padding-top: 10px;
                background-color: #333333; /* Darker background for footer */
                border-top: 2px solid #ccc;
            }

            .archive-container, .extra-content-container {
                display: flex;
                flex-direction: column;
                flex: 1;
                
            }

            .archive-container {
                
            }

            .extra-content-container {
                display: flex;
                
            padding-top: 180px;
            align-items: center;
            height: 60vh;
            background-color: #333333;
            color: #fff;
            margin: 0px;
            overflow: hidden;
            

            }

            .top-archive-container {
                margin-bottom: 10px;
            }

                .top-archive-container h3 {
                    background: linear-gradient(10deg, #02ce85, #02ceab);
                    -webkit-background-clip: text;
                    color: transparent;
                }

            .bottom-archive-container { /* <<<<Note:> This doesnt exist anymore, i believe it was replaced with popup, i think its safe to delete -10:20pm on 11/9/24 <<< */
                display: flex;
                flex-direction: column;
            }



            /* Scrollbar Width */
            * {
                scrollbar-width: thin;
                scrollbar-color: #535659 #282c30;
            }

                /* Scrollbar for WebKit browsers */
                *::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                    background-color: #0d1012; /* Scrollbar width color */
                }

                *::-webkit-scrollbar-track {
                    background-color: #282c30; /* Track color */
                }

                *::-webkit-scrollbar-thumb {
                    background-color: #535659; /* Thumb color */
                    border-radius: 6px;
                }



            /* Creating a Menu Icon- contents, found below*/

            .menu-icon {
                width: 35px;
                height: 5px;
                background-color: black;
                margin: 6px 0;
                cursor: pointer;
            }

            .dropdown {
                display: none;
                position: absolute;
                background-color: #f9f9f9;
                box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                z-index: 1;
                margin-top: 10px;
                list-style-type: none;
                padding: 0;
            }

                .dropdown a {
                    color: black;
                    padding: 12px 16px;
                    text-decoration: none;
                    display: block;
                }

                    .dropdown a:hover {
                        background-color: #f1f1f1;
                    }

            .show {
                display: block;
            }

            /* Creating a Menu Icon, contents, found above */

            /* this somehow hides the signup below, found below*/
            .hidden {
                display: none;
            }


            /* Creating the Popup Archive Section */
                    .popup {
                        width: 100%;
                        height: 80%;
                        min-height: 480px;
                        max-height: 60vh; /* Set a maximum height */
                        border-radius: 48px;
                        box-sizing: border-box;
                        border: 16px solid #3c3c3c; /* Dark mode border color */
                        background-color: #2c2c2c; /* Dark mode popup background */
                        overflow: hidden; /* Prevent the popup from scrolling */
                        box-shadow: 16px 16px 48px #121212; /* Dark mode box shadow */
                        position: relative;
                        display: flex;
                        flex-direction: column;
                    }

                    .tabs {
                        width: 100%;
                        max-width: 200px;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between; /* Ensure even spacing */
                        position: relative;
                        
                    }

                    




                    .tab-container {
                    height: 100%;
                    overflow-y: auto; /* Enable vertical scrolling for tabs */
                    z-index: 101; /* Move the z-index forward */
                    direction: rtl; /* Move scrollbar to the left side */
                }

                .tab-container::-webkit-scrollbar {
                    width: 12px; /* Width of the scrollbar */
                }

                .tab-container::-webkit-scrollbar-track {
                    background: #3c3c3c; /* Dark mode scrollbar track color */
                }

                .tab-container::-webkit-scrollbar-thumb {
                    background-color: #888; /* Dark mode scrollbar thumb color */
                    border-radius: 10px; /* Rounded edges */
                    border: 3px solid #3c3c3c; /* Padding around the thumb */
                }



                .tabs label {
                    height: calc(100% / 6); /* Make each label take up 1/6th of the height */
                    display: flex;
                    
                    align-items: center; /* Center text vertically */
                }

                #tab1:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 0));
                }

                #tab1:checked + label + .text-container-1 {
                    display: block;
                }

                #tab2:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 1));
                }

                #tab2:checked + label + .text-container-2 {
                    display: block;
                }

                #tab3:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 2));
                }

                #tab3:checked + label + .text-container-3 {
                    display: block;
                }

                #tab4:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 3));
                }

                #tab4:checked + label + .text-container-4 {
                    display: block;
                }

                #tab5:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 4));
                }

                #tab5:checked + label + .text-container-5 {
                    display: block;
                }

                #tab6:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 5));
                }

                #tab6:checked + label + .text-container-6 {
                    display: block;
                }

                #tab7:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 6));
                }

                #tab7:checked + label + .text-container-7 {
                    display: block;
                }

                #tab8:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 7));
                }

                #tab8:checked + label + .text-container-8 {
                    display: block;
                }

                #tab9:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 8));
                }

                #tab9:checked + label + .text-container-9 {
                    display: block;
                }

                #tab10:checked ~ .marker {
                    transform: translateY(calc(calc(100% / 10) * 9));
                }

                #tab10:checked + label + .text-container-10 {
                    display: block;
                }

                input[type="radio"] {
                    display: none;
                    width: 0;
                }

                label:hover,
                input[type="radio"]:checked + label {
                    opacity: 1;
                }


                label {
                    font-size: 24px;
                    font-weight: 700;
                    cursor: pointer;
                    color: #a1a1a1; /* Dark mode label color */
                    opacity: 0.4;
                    transition: opacity 0.4s ease-in-out;
                    display: block;
                    width: calc(100% - 48px);
                    text-align: left; /* Align text to the left */
                    z-index: 100;
                    user-select: none;
                    position: relative; /* Needed for absolute positioning of text containers */
                    direction: ltr; /* Ensure the text direction is left to right */
                }




                .text-container {
                    display: none;
                    text-align: left;
                    font-size: 24px;
                    font-weight: 700;
                    color: #d3d3d3; /* Dark mode text container color */
                    opacity: 0.8;
                    transition: opacity 0.4s ease-in-out;
                    position: absolute;
                    top: 0; /* Ensure it starts at the top */
                    left: calc(100% + 12px); /* Align next to the tabs */
                    width: calc(80% - 36px); /* Adjust the width as needed */
                    white-space: normal; /* Ensures text wraps within container */
                    word-wrap: break-word;
                    height: 100%; /* Ensure it takes the full height */
                    overflow-y: auto; /* Enable vertical scrolling within the text container */
                }


                .text-container {
                    display: none;
                    text-align: left;
                    font-size: 24px;
                    font-weight: 700;
                    color: #d3d3d3; /* Dark mode text container color */
                    opacity: 0.8;
                    transition: opacity 0.4s ease-in-out;
                    position: absolute;
                    top: 0; /* Ensure it starts at the top */
                    left: 100%; /* Ensure it is to the right of the tabs */
                    
                    width: 175%; /* Adjust the width as needed */
                    white-space: normal; /* Ensures text wraps within container */
                    word-wrap: break-word;
                    height: 100%; /* Ensure it takes the full height */
                    overflow-y: scroll; /* Enable vertical scrolling within the text container */
                    direction: ltr; /* Ensure the scrollbar is on the right side */
                }

                .text-container::-webkit-scrollbar {
                    width: 12px; /* Width of the scrollbar */
                    direction: ltr; /* Ensure scrollbar is usable */
                }

                /* Custom scrollbar styling */
                .text-container::-webkit-scrollbar-track {
                    background: #3c3c3c; /* Dark mode scrollbar track color */
                }

                .text-container::-webkit-scrollbar-thumb {
                    background-color: #888; /* Dark mode scrollbar thumb color */
                    border-radius: 10px; /* Rounded edges */
                    border: 3px solid #2c2c2c; /* Padding around the thumb */
                }





                /* The CSS content below, is for the store */

                .scene {
                    width: 150px;
                    height: 150px;
                    perspective: 900px; /* Increased perspective to create more depth */
                    
                    
                }

                .placard-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 1s ease;
                }
                .placard {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 20px;
                    background-color: rgba(255, 255, 255, 0.1);
                    border: 1px solid #fff;
                    backface-visibility: hidden;
                    display: flex;
                    flex-direction: column;
                }
                /* Positions for each placard */
                .placard:nth-of-type(1) { transform: rotateY(0deg) translateZ(625px); } /* Adjust this translate Z value for spacing between the placards */
                .placard:nth-of-type(2) { transform: rotateY(18deg) translateZ(625px); }
                .placard:nth-of-type(3) { transform: rotateY(36deg) translateZ(625px); }
                .placard:nth-of-type(4) { transform: rotateY(54deg) translateZ(625px); }
                .placard:nth-of-type(5) { transform: rotateY(72deg) translateZ(625px); }
                .placard:nth-of-type(6) { transform: rotateY(90deg) translateZ(625px); }
                .placard:nth-of-type(7) { transform: rotateY(108deg) translateZ(625px); }
                .placard:nth-of-type(8) { transform: rotateY(126deg) translateZ(625px); }
                .placard:nth-of-type(9) { transform: rotateY(144deg) translateZ(625px); }
                .placard:nth-of-type(10) { transform: rotateY(162deg) translateZ(625px); }
                .placard:nth-of-type(11) { transform: rotateY(180deg) translateZ(625px); }
                .placard:nth-of-type(12) { transform: rotateY(198deg) translateZ(625px); }
                .placard:nth-of-type(13) { transform: rotateY(216deg) translateZ(625px); }
                .placard:nth-of-type(14) { transform: rotateY(234deg) translateZ(625px); }
                .placard:nth-of-type(15) { transform: rotateY(252deg) translateZ(625px); }
                .placard:nth-of-type(16) { transform: rotateY(270deg) translateZ(625px); }
                .placard:nth-of-type(17) { transform: rotateY(288deg) translateZ(625px); }
                .placard:nth-of-type(18) { transform: rotateY(306deg) translateZ(625px); }
                .placard:nth-of-type(19) { transform: rotateY(324deg) translateZ(625px); }
                .placard:nth-of-type(20) { transform: rotateY(342deg) translateZ(625px); }



                /* MainStoreContainers */
                .MainStoreContainer {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                /* Top and Bottom Containers */
                .TopStoreContainer,
                .BottomStoreContainer {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .BottomStoreContainer {
                    flex-direction: row;
                }

                /* Left and Right Bottom Containers */
                .LeftBottomStoreContainer,
                .RightBottomStoreContainer {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 10px;
                }

                /* Right Bottom Containers for Cost */
                .RightBottomStoreContainer {
                    justify-content: flex-end;
                }

                /* Hide broken image icon until an image is uploaded */
                .TopStoreContainer img {
                    display: none;
                }
                .TopStoreContainer img[src] {
                    display: block;
                }

                /* Styles for arrows */
                .arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 2rem;
                    color: white;
                    cursor: pointer;
                }
                .left-arrow {
                    left: 10px;
                }
                .right-arrow {
                    right: 10px;
                }


                /* This code below has to do with both the click and hold to record button and i believe the profile image too */


                /* This code changes the color of the upload mp3 button when someone uploads an mp3 through the click and hold method */


                /* Uncomment out when ready to plug in please =)

                #removeAudioBtn {
                    position: absolute;
                    top: 10px; */ /* Adjust vertical position */
                /*    right: 5px; */ /* Adjust horizontal position */
                /*    background-color: red;
                    color: white;
                    border: none;
                    cursor: pointer;
                }

                button:disabled {
                    background-color: gray;
                    cursor: not-allowed;
                }


                */




                /* Additional styles */



                /* Uncomment out when ready to plug in please =)


                .smallcontainer {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    gap: 20px;
                }

                .container {
                    flex: 1;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }

                #rightyrightcontainer img {
                    max-width: 100%;
                    cursor: pointer;
                }

                #centercentercentercontainer audio {
                    display: block;
                    margin-top: 20px;
                }

                */






                /* Styles for profile image upload */

                

                .profile-image-container {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    width: 200px;
                    height: 200px;
                    background-color: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .profile-image-placeholder {
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    text-align: center;
                    line-height: 200px;
                    color: white;
                    font-size: 16px;
                } 





                /* Uncomment out when ready to plug in please =)
                .delete-button {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background-color: red;
                    color: white;
                    border: none;
                    cursor: pointer;
                }


                */



                /* Uncomment out when ready to plug in please =)

                .extra-entry {
                    margin: 10px 0;
                    padding: 10px;
                    background-color: #444;
                    border-radius: 5px;
                }

                */




                /* This code here, is for, zooming in: */

                /* CSS for modal overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* Ensure it is above other elements */
    visibility: hidden; /* Initially hidden */
    opacity: 0;
    transition: visibility 0s, opacity 0.3s; /* Smooth transition */
}

.modal-overlay.visible {
    visibility: visible;
    opacity: 1;
}

/* CSS for modal image */
.modal-img {
    max-width: 600px;
    max-height: 600px;
    transition: max-width 0.3s, max-height 0.3s;
}




/* this code below is for the audio media player, which, i learned, can be activated by:>>>>>>>>>> audioElement.controls = true; // Enable media player controls <<<<<<<<<< */

audio {
    --background-color: #333;
    --button-color: #ccc;
    --button-hover-color: #fff;
    --track-color: #333;
    --track-filled-color: #ccc;
    background-color: var(--background-color);
    color: var(--button-color);
}

audio::-webkit-media-controls-panel {
    background-color: var(--background-color);
}

audio::-webkit-media-controls-play-button,
audio::-webkit-media-controls-current-time-display,
audio::-webkit-media-controls-time-remaining-display,
audio::-webkit-media-controls-timeline,
audio::-webkit-media-controls-volume-slider,
audio::-webkit-media-controls-mute-button,
audio::-webkit-media-controls-fullscreen-button,
audio::-webkit-media-controls-cast-button,
audio::-webkit-media-controls-rewind-button,
audio::-webkit-media-controls-return-to-realtime-button,
audio::-webkit-media-controls-overflow-menu-button {
    color: var(--button-color);
}

audio::-webkit-media-controls-play-button:hover,
audio::-webkit-media-controls-current-time-display:hover,
audio::-webkit-media-controls-time-remaining-display:hover,
audio::-webkit-media-controls-timeline:hover,
audio::-webkit-media-controls-volume-slider:hover,
audio::-webkit-media-controls-mute-button:hover,
audio::-webkit-media-controls-fullscreen-button:hover,
audio::-webkit-media-controls-cast-button:hover,
audio::-webkit-media-controls-rewind-button:hover,
audio::-webkit-media-controls-return-to-realtime-button:hover,
audio::-webkit-media-controls-overflow-menu-button:hover {
    color: var(--button-hover-color);
}

audio::-webkit-media-controls-timeline,
audio::-webkit-media-controls-timeline-container {
    background-color: var(--track-color);
}

audio::-webkit-media-controls-timeline:-webkit-media-controls-timeline,
audio::-webkit-media-controls-timeline::-webkit-media-controls-timeline-container {
    color: var(--track-filled-color);
}

/* this section below is the CSS for the channel numbering */

/* Container for the Now Playing and Channel Section */

.NowPlayingAndChannelContainer {
    display: flex;
    flex-direction: row;
    align-items: center; /* Ensure items are centered vertically */
}

/* Now Playing Section */
#headerRightContainer002 {
    flex: 1;
    margin-right: 20px; /* Add some margin to separate from channels */
}

/* Coming Up Next Section */
#headerRightContainer004 {
    flex: 1;
    margin-right: 20px; /* Add some margin to separate from channels */
}

/* Recently Played Section */
.RecentlyPlayedContainer {
    flex: 1;
    margin-right: 20px; /* Add some margin to separate from channels */
}

/* Channel Section */
#Channels {
    display: flex;
    align-items: center; /* Ensure items are centered vertically */
    font-size: 18px; /* Adjust font size as needed */
}

/* Channel Number */
#currentChannelNumber {
    margin: 0 10px; /* Add some margin to separate from arrows */
}

/* Channel Navigation Arrows */
button#prevChannel, button#nextChannel {
    background-color: #f0f0f0; /* Light background color */
    border: none;
    color: #000; /* Arrow color */
    font-size: 20px; /* Adjust font size as needed */
    cursor: pointer;
}

button#prevChannel:hover, button#nextChannel:hover {
    background-color: #e0e0e0; /* Slightly darker on hover */
}

button#prevChannel:focus, button#nextChannel:focus {
    outline: none; /* Remove focus outline */
}

/* Upvote and Downvote Buttons */
.upvote, .downvote {
    color: gray;
    cursor: pointer;
}

.upvote.clicked {
    color: orange;
}

.downvote.clicked {
    color: purple;
}



/* This code is to implement the video feature */

.header-left-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
}

#recordButton02 {
    cursor: pointer;
    max-width: 200px;
    max-height: 200px;
}

#headerRightContainer002.01 { /* Basic styling for the video container */
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative; /* For positioning the "X" button */
    margin-top: 20px;
    max-width: 600px;
    margin: 0 auto;
    
}




    


#videoPlayer {
    width: 100%;
    height: auto;
    margin-top: 20px;
}


#VideoTitle, #VideoDescription, #mp3Time002 {
    margin-top: 10px;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
}

#VideoDescription {
    height: 100px;
}

#uploadLogoBtn02 {
    margin-top: 10px;
}


.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 50%;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 20px;
}







/* do i want?:> 
button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
}

<<<<<<<<<<< ? */

button:hover {
    background-color: #0056b3;
}













/* Styling for control buttons */
/* 
do i want this? 
button {
    margin: 5px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
} 
    */

/* Close button styling */

/* Input field styling */


/* this section below here is to add CSS too limit Logo Size inside headerRightContainer002 (the image) */

#headerRightContainer002 img {
    max-width: 150px;
    max-height: 150px;
}

/* this section above here is to add CSS too limit Logo Size inside headerRightContainer002 (the image) */

/* preview containers styling */


  /* Add any necessary styles here */
  #previewContainer video {
            width: 100%;
            margin-bottom: 10px;
        }
        #previewContainer label {
            display: block;
            margin-top: 10px;
        }
        #previewContainer input[type="checkbox"] {
            margin-right: 10px;
        }



/* THIS CODE HERE BELOW IS FOR COLORING THE PRESENT, PAST, & FUTURE DAYS OF THE CALENDAR TO ANOTHER COLOR! */
#scheduleContainer .date-header.past-day .header-text {
    background: linear-gradient(45deg, #e6e6fa, #dda0dd); /* <Note 1 of 2 for part YYY002 < The only diff between this and the other note is the degrees; and i love that! ***Updated this from YYY to YYY002 cause apparently i created another YYY hahahaha -7:02pm on 2/5/25 */ 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
}

#scheduleContainer .date-header.future-day .header-text {
    background: linear-gradient(180deg, #e6e6fa, #dda0dd); /* <Note 2 of 2 for part YYY002 < The only diff between this and the other note is the degrees; and i love that! ***Updated this from YYY to YYY002 cause apparently i created another YYY hahahaha -7:02pm on 2/5/25 */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
}


#scheduleContainer .date-header.current-day .header-text {
    background: linear-gradient(180deg, #ffd700, #ffeb3b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
}

/* THIS CODE HERE ABOVE IS FOR COLORING THE PRESENT, PAST, & FUTURE DAYS OF THE CALENDAR TO ANOTHER COLOR! */


/* the code below here is for AD00002 */

.scene00002 {
            width: 150px; /* Set max width to 150px */
            height: 150px; /* Adjust height proportionally */
            perspective: 600px;
        }
        .placard-container00002 {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 1s ease; /* Smooth transition */
        }
        .placard00002 {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid #fff;
            backface-visibility: hidden;
            /* Flex column for MainStoreContainers */
            display: flex;
            flex-direction: column;
        }
        /* Positions for each placard */
        .front00002  { transform: rotateY(0deg) translateZ(75px); } /* Adjust translateZ for new size */
        .right00002  { transform: rotateY(-90deg) translateZ(75px); }
        .back00002   { transform: rotateY(-180deg) translateZ(75px); }
        .left00002   { transform: rotateY(-270deg) translateZ(75px); }

        /* MainStoreContainers */
        .MainStoreContainer00002 {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            position: relative; /* Ensure relative positioning for arrow placement */
        }

        /* Top and Bottom Containers */
        .TopStoreContainer00002,
        .BottomStoreContainer00002 {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .BottomStoreContainer00002 {
            flex-direction: row; /* Display flex row */
        }

        /* Left and Right Bottom Containers */
        .LeftBottomStoreContainer00002,
        .RightBottomStoreContainer00002 {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
        }

        /* Right Bottom Containers for Cost */
        .RightBottomStoreContainer00002 {
            justify-content: flex-end; /* Align text to the right */
        }

        /* Hide broken image icon until an image is uploaded */
        .TopStoreContainer00002 img {
            display: none;
        }
        .TopStoreContainer00002 img[src] {
            display: block;
        }

        /* Styles for arrows */
        .arrow00002 {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-size: 2rem;
            color: white;
            cursor: pointer;
        }
        .left-arrow00002 {
            left: 10px;
        }
        .right-arrow00002 {
            right: 10px;
        }


/* the code above here is for AD00002 */




/* the code below here is for AD00003 */



.scene00003 {
    width: 150px; /* Set max width to 150px */
    height: 150px; /* Adjust height proportionally */
    perspective: 600px;
}
.placard-container00003 {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 1s ease; /* Smooth transition */
}
.placard00003 {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid #fff;
    backface-visibility: hidden;
    /* Flex column for MainStoreContainers */
    display: flex;
    flex-direction: column;
}
/* Positions for each placard */
.front00003  { transform: rotateY(0deg) translateZ(75px); } /* Adjust translateZ for new size */
.right00003  { transform: rotateY(-90deg) translateZ(75px); }
.back00003   { transform: rotateY(-180deg) translateZ(75px); }
.left00003   { transform: rotateY(-270deg) translateZ(75px); }

/* MainStoreContainers */
.MainStoreContainer00003 {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative; /* Ensure relative positioning for arrow placement */
}

/* Top and Bottom Containers */
.TopStoreContainer00003,
.BottomStoreContainer00003 {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
.BottomStoreContainer00003 {
    flex-direction: row; /* Display flex row */
}

/* Left and Right Bottom Containers */
.LeftBottomStoreContainer00003,
.RightBottomStoreContainer00003 {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
}

/* Right Bottom Containers for Cost */
.RightBottomStoreContainer00003 {
    justify-content: flex-end; /* Align text to the right */
}

/* Hide broken image icon until an image is uploaded */
.TopStoreContainer00003 img {
    display: none;
}
.TopStoreContainer00003 img[src] {
    display: block;
}

/* Styles for arrows */
.arrow00003 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    color: white;
    cursor: pointer;
}
.left-arrow00003 {
    left: 10px;
}
.right-arrow00003 {
    right: 10px;
}


/* the code above here is for AD00003 */


/*the code below is for the toast */

/* Toast notification styling */
/* QUEST:>>>>>>>>>>>>>>>>>>>>>>>> NOTE: THIS CSS TOASTS IS NOT SHOWING ALL OF MY TOASTS CORRECTLY. LIKE IF MULTIPLE SHOULD BE SHOWING UP; ONLY ONE IS SHOWING UP. THEY SHOULD BE SHOWING UP STACKED ON TOP OF ONE ANOTHER. THATS THIS QUEST. I HAVE IT, RIGHT NOW, SET UP, THAT IT HIDES THE BAD ERRORS, BUT I NEED EM VISIBLE, TO KNOW WHICH ERRORS I GOTTA FIX. LIKE I THINK 05 KEEPS SHOWING UP BUT NOW DONT. MOVING FORWARD CAUSE IT DONT SHOW UP! -10:01PM on 11/30/25*/
.toast {
    position: fixed;
    right: 20px;
    padding: 10px 20px;
    background-color: #333;
    color: #fff;
    border-radius: 5px;
    z-index: 1000;
    opacity: 0.9;
}

.toast-1 {
    bottom: 20px !important;
}

.toast-2 {
    bottom: 40px !important;
}

.toast-3 {
    bottom: 60px !important;
}

.toast-4 {
    bottom: 80px !important;
}

.toast-5 {
    bottom: 100px !important;
}

.toast-6 {
    bottom: 120px !important;
}


/* the code above is for the toast */

/* the code below is for found a bug? in footer- thang */

.footer-container-for-bug-and-neighbors {
    display: flex;
    align-items: center; /* Align items vertically in the center */
    justify-content: flex-start; /* Align items to the start */
    gap: 1px; /* Control the space between items */
    
}


#descriptionboxforbug {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 70px;
    background-color: white;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}



.toast-container-for-bug-image {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column-reverse; /* Stack upwards */
    align-items: flex-end;
    gap: 10px; /* Space between toasts */
    z-index: 1000;
}

.toast-for-bug-image {
    padding: 10px 20px;
    background-color: #333;
    color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    opacity: 0.9;
}


/* the code above is for found a bug? in footer- thang */

/* the code below is for 3sidedplacard */

.scene0000002 {
    width: 200px;
    height: 200px;
    perspective: 1000px; /* Increased perspective to create more depth */
}
.placard-container0000002 {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 1s ease;
}
.placard0000002 {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid #fff;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
}
/* Positions for each placard */
.placard0000002:nth-of-type(1) { transform: rotateY(0deg) translateZ(300px); } /* Adjust this translate Z value for spacing between the placards */
.placard0000002:nth-of-type(2) { transform: rotateY(36deg) translateZ(300px); }
.placard0000002:nth-of-type(3) { transform: rotateY(72deg) translateZ(300px); }
.placard0000002:nth-of-type(4) { transform: rotateY(108deg) translateZ(300px); }
.placard0000002:nth-of-type(5) { transform: rotateY(144deg) translateZ(300px); }
.placard0000002:nth-of-type(6) { transform: rotateY(180deg) translateZ(300px); }
.placard0000002:nth-of-type(7) { transform: rotateY(216deg) translateZ(300px); }
.placard0000002:nth-of-type(8) { transform: rotateY(252deg) translateZ(300px); }
.placard0000002:nth-of-type(9) { transform: rotateY(288deg) translateZ(300px); }
.placard0000002:nth-of-type(10) { transform: rotateY(324deg) translateZ(300px); }

/* MainStoreContainers */
.MainStoreContainer0000002 {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
}

/* Top and Bottom Containers */
.TopStoreContainer0000002,
.BottomStoreContainer0000002 {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
.BottomStoreContainer0000002 {
    flex-direction: row;
}

/* Left and Right Bottom Containers */
.LeftBottomStoreContainer0000002,
.RightBottomStoreContainer0000002 {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
}

/* Right Bottom Containers for Cost */
.RightBottomStoreContainer0000002 {
    justify-content: flex-end;
}

/* Hide broken image icon until an image is uploaded */
.TopStoreContainer0000002 img0000002 {
    display: none;
}
.TopStoreContainer0000002 img0000002[src] {
    display: block;
}

/* Styles for arrows */
.arrow0000002 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    color: white;
    cursor: pointer;
}
.left-arrow0000002 {
    left: 10px;
}
.right-arrow0000002 {
    right: 10px;
}


/* the code above is for 3sidedplacard */

/* The code below is for the toast for security purposes */

<style>
.toast-security {
    position: fixed;
    right: 20px;
    padding: 10px 20px;
    background-color: #333;
    color: #fff;
    border-radius: 5px;
    z-index: 1000;
    opacity: 0.9;
    visibility: hidden;
    max-width: 250px;
    bottom: 30px;
    text-align: center;
    font-size: 17px;
    white-space: nowrap;
}

.toast-security.show {
    visibility: visible;
    /* Add animation: Take 0.5 seconds to fade in and out the snackbar. */
    -webkit-animation: fadein-security 0.5s, fadeout-security 0.5s 2.5s;
    animation: fadein-security 0.5s, fadeout-security 0.5s 2.5s;
}

@-webkit-keyframes fadein-security {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
}

@keyframes fadein-security {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
}

@-webkit-keyframes fadeout-security {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
}

@keyframes fadeout-security {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
}

/* The code above is for the toast for security purposes */

        </style>
    </head>
    
    <body>
    <!-- Unlock this code to see more -->    
    <header class="header-container">
    
    <div class="containerForTopLeftSection" style="display: flex; flex-direction: column; min-height: 650px; justify-content: space-between;"> <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 1 of 11  <<< which is to let me know: "the header's size' is modified in multiple locations. this being one of em. ill try to mark down where else i see em as time flows by. --> 
        <div class="header-left-top-container">

            <!-- TESTING TESTING: "AD00002 PLACARD" IS BEING PLACED BELOW HERE! IT IS DISTINGUISHED WITH 00002 INFO! -->

                <div class="scene00002">
                    <div class="placard-container00002">
                        <!-- Start of the first placard -->
                        <div class="placard00002 front00002">
                            <!-- Main container for the first placard -->
                            <div class="MainStoreContainer00002 MainStoreContainer00100002">
                                <!-- Top part of the first placard -->
                                <div class="TopStoreContainer00002 TopStoreContainer001A00002">
                                    <img src="/includes/Uminionad001.png" alt="Image 1" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <!-- Bottom part of the first placard -->
                                <div class="BottomStoreContainer00002 BottomStoreContainer001B00002">
                                    <div class="LeftBottomStoreContainer00002 LeftBottomStoreContainer00100002" style="margin-top: -75px; transform: scale(0.8);">
                                        Next Union Event: 
                                    </div>
                                    <div class="RightBottomStoreContainer00002 RightBottomStoreContainer00100002" style="margin-top: -75px; transform: scale(0.8);">
                                    <div id="dateForAd001"></div><!-- OLDER CODE HERE:>>>>>>>>>>>>>>>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Apr &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;24<<<<<<<<<<<<<<<< -->
                                    </div>
                                </div>

                                <!-- Left arrow for navigation -->
                                <div class="arrow00002 left-arrow00002">&#9664;</div>
                                <!-- Right arrow for navigation -->
                                <div class="arrow00002 right-arrow00002">&#9654;</div>
                            </div>
                        </div>
                        <!-- End of the first placard -->

                        <!-- Start of the second placard -->
                        <div class="placard00002 right00002">
                            <!-- Main container for the second placard -->
                            <div class="MainStoreContainer00002 MainStoreContainer00200002">
                                <!-- Top part of the second placard -->
                                <div class="TopStoreContainer00002 TopStoreContainer002A00002">
                                    <img src="/includes/WYSad001.png" alt="Image 2" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <!-- Bottom part of the second placard -->
                                <div class="BottomStoreContainer00002 BottomStoreContainer002B00002">
                                <div class="LeftBottomStoreContainer00002 LeftBottomStoreContainer00200002" style="margin-top: -55px; transform: scale(0.8);">
                                <small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AD- Sponsored By: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WhatsYorStory.com</small>
                                </div>
                                    <div class="RightBottomStoreContainer00002 RightBottomStoreContainer00200002">                                        
                                    </div>
                                </div>
                                <!-- Left arrow for navigation -->
                                <div class="arrow00002 left-arrow00002">&#9664;</div>
                                <!-- Right arrow for navigation -->
                                <div class="arrow00002 right-arrow00002">&#9654;</div>
                            </div>
                        </div>
                        <!-- End of the second placard -->

                        <!-- Start of the third placard -->
                        <div class="placard00002 back00002">
                            <!-- Main container for the third placard -->
                            <div class="MainStoreContainer00002 MainStoreContainer00300002">
                                <!-- Top part of the third placard -->
                                <div class="TopStoreContainer00002 TopStoreContainer003A00002">
                                    <img src="/includes/Uminionad001.png" alt="Image 3" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <!-- Bottom part of the third placard -->
                                <div class="BottomStoreContainer00002 BottomStoreContainer003B00002">
                                    <div class="LeftBottomStoreContainer00002 LeftBottomStoreContainer00300002" style="margin-top: -75px; transform: scale(0.8);">
                                        Next Union Event: 
                                    </div>
                                    <div class="RightBottomStoreContainer00002 RightBottomStoreContainer00300002" style="margin-top: -75px; min-width: 80px; transform: scale(0.7);">
                                        <div id="dateForAd002" style="font-size: 17px !important;"></div> <!--REMOVED CAUSE OUTDATED:>>>>>>>>>>>>>>>>>>>> <small>Apr 24 (9am to 9pm)</small> <<<<<<<<<<<<<<<<<<<< -->
                                    </div>
                                </div>

                                <!-- Left arrow for navigation -->
                                <div class="arrow00002 left-arrow00002">&#9664;</div>
                                <!-- Right arrow for navigation -->
                                <div class="arrow00002 right-arrow00002">&#9654;</div>
                            </div>
                        </div>
                        <!-- End of the third placard -->

                        <!-- Start of the fourth placard -->
                        <div class="placard00002 left00002">
                            <!-- Main container for the fourth placard -->
                            <div class="MainStoreContainer00002 MainStoreContainer00400002">
                                <!-- Top part of the fourth placard -->
                                <div class="TopStoreContainer00002 TopStoreContainer004A00002">
                                    <img src="/includes/WYSad001.png" alt="Image 4" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <!-- Bottom part of the fourth placard -->
                                <div class="BottomStoreContainer00002 BottomStoreContainer004B00002">
                                <div class="LeftBottomStoreContainer00002 LeftBottomStoreContainer00400002" style="margin-top: -55px; transform: scale(0.8);">
                                    <small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AD- Sponsored By: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WhatsYorStory.com</small>
                                </div>
                                    <div class="RightBottomStoreContainer00002 RightBottomStoreContainer00400002">                                    
                                    </div>
                                </div>
                                <!-- Left arrow for navigation -->
                                <div class="arrow00002 left-arrow00002">&#9664;</div>
                                <!-- Right arrow for navigation -->
                                <div class="arrow00002 right-arrow00002">&#9654;</div>
                            </div>
                        </div>
                        <!-- End of the fourth placard -->
                    </div>
                </div>

            <!-- TESTING TESTING: "AD00002 PLACARD" IS BEING PLACED ABOVE HERE! IT IS DISTINGUISHED WITH 00002 INFO! -->          



        </div> <!-- closing div for "header-left-top-container" i believe -->


        



        <div class="othertopleftbottomcontainer">
            <!-- Form for uploading MP3 files -->
            <form id="mp3Form" action="includes/submitMp3.php" method="post" enctype="multipart/form-data">
                
                <!-- New arrangement for mp3Details -->
                <div id="mp3Details" style="display: none; max-height: 250px;">
                    <!-- Label for the description field -->
                    <label for="mp3DetailsLabel" style="text-align: center; display: block; margin-bottom: 1px;"></label> <!-- Removed: "Schedule a Time for your Audio/Show/Episode to play, then (optional) choose a: Title, Description, & Logo" so words could fit better -6:45pm on 2/3/25 -->
                    
                    
                    <!-- Input for the title of the audio -->
                    <input type="text" id="mp3Title" name="mp3Title" placeholder="Title of Audio?" style="margin-bottom: 1px;">
                    
                    <!-- Label for the description field -->
                    <label for="OptionalDescriptionField" style="margin-bottom: 15px;"></label> <!-- Removed: "Description:" so words could fit better -6:45pm on 2/3/25 -->
                        <!-- Textarea for the optional description -->
                        <textarea id="OptionalDescriptionField" name="mp3Description" maxlength="1000" placeholder="Optional Description (max 1000 characters)" style="margin-bottom: 5px;"></textarea>
                        

                    <!-- Input for scheduling a time for the audio -->
                    <label for="mp3Time" style="text-align: center; display: block; margin-bottom: 1px; min-width: 180px;">When to Air?</label>
                        <input type="datetime-local" id="mp3Time" name="mp3Time" style="margin-bottom: 15px; max-width: 100px;">

                    <br>

                    <!-- Button to upload a logo -->
                    <div id="uploadLogoBtn" style="display: none; cursor: pointer; padding: 5px; background-color: #007BFF; color: white; text-align: center; border-radius: 5px; margin-bottom: 5px;">
                        Upload Logo
                    </div>
                        <!-- Input for selecting a logo file -->                     
                        <input type="file" id="logoInput" name="logoInput" accept="image/*" style="display: none;">
                        



                    <!-- Audio preview section -->
                    <div id="audioPreview" style="display: none; margin-bottom: 5px;">
                        <audio id="recordedAudio" controls style="max-width: 200px;"></audio>
                        <!-- Button to remove the recorded audio -->
                        <button id="removeAudioBtn">X</button>
                    </div>
                </div>

                <!-- Image that acts as a record button -->
                <div class="header-left-bottom-container" id="headerLeftBottomContainer">
                    <img id="recordButton" class="exclude-zoom" src="/includes/UnionRadioLogoVersion003ForUnionRadioWebsite.png" alt="Union Radio Version 001" style="max-width: 200px; max-height: 200px; background-position: center;">
                </div>

                <!-- Section remaining below the image -->
                <!-- Button to submit the form -->
                <button type="submit" id="submitMp3" name="submit" value="Upload">Submit</button>
                <!-- Input for selecting the audio file, initially hidden -->
                <input type="file" id="fileInput" name="my_audio" style="display: none;">
                <!-- Button to trigger the upload of MP3 file -->
                <button type="button" id="uploadMp3Btn">Upload Mp3?</button>
                
            </form>

            <!-- Container to display the upload status -->
            <div id="uploadStatus">
            </div>

        </div><!-- closing div for "othertopleftbottomcontainer" -->

    </div>  <!-- closing div for "containerForTopLeftSection" -->


            <!-- Main container for the header-left section -->
<div class="header-left-container" id="headerLeftContainer" style="position: absolute; top: 150px; left: 50%; transform: translateX(-50%);">







    <div class="containerForBannersABOVEandBELOWThe3BillboardPlacardThang" style="display: flex; flex-direction: column;">            
        <div class="innerDivAbovePlacard" style="position: absolute; top: -150px !important; left: 50%; transform: translateX(-50%);">
            <img src="/StoreProductsAndImagery/Banner001.png" id="BannerAtTopOfPage" alt="Banner Image" style="max-height: 190px;">
        </div>

            
            

            <!-- TESTING TESTING:> "3sidedplacard" IS BEING PLACED BELOW HERE! IT IS DISTINGUISHED WITH 0000002 INFO! -->

            <div class="scene0000002" style="margin-top: 80px;">
                <div class="placard-container0000002">


        <!-- 3 Sided Store- Placard 1 of 10 --> 
                <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0010000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer001A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0000002" src="/StoreProductsAndImagery/UkraineLogo001.png" alt="Image 1" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer001B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0010000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene0000002Placard001('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0010000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene0000002Placard001('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <div class="CenterBottomStoreContainer0000002 CenterBottomStoreContainer0010000002" id="textContainerForScene0000002Placard001Title" style="grid-row: 1; grid-column: 1 / span 9; flex: 0 0 135%; display: flex; font-size: 10px; transform: scale(0.8) !important; margin-left: -10px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold; position: relative; top: 55px; left: 25px;">
                                    Sold Ukranian Posters- Helps Ukraine-<br>Buy More Ammo. Help Ukraine<br>Buy More Ammo- over at:
                                </div>

                                <div class="ButtonContainer0000002 ButtonContainer0010000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
                                    <button id="UkraineWebsiteButton0000002" style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; max-height: 45px; min-width: 105px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;" onclick="window.open('https://u24.gov.ua', '_blank')">
                                        &nbsp;u24.gov.ua
                                    </button>
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0010000002" style="grid-row: 2; grid-column: 3; flex: 0 0 9%; display: flex; transform: scale(0.7) !important; margin-left: -10px !important; position: relative; top: 66px;">
                                    <button id="UStoreButton004.001AAA" data-sku="UStoreButton004.001AAA" style="display: flex; align-items: center; justify-content: center; width: 100%; min-width: 145px; min-height: 45px; max-height: 45px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        +$99.95 Poster &#128722;
                                    </button>
                                </div>

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0010000002" id="UkranianButtonContainer0000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0000002-popup-description">
                                            <div id="FolderContainerForEyeButton0000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0000002" onclick="showTabEyeButton0000002('ART0000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>

                    <!-- 3 Sided Store- Placard 2 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0020000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer002A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0000002" src="/StoreProductsAndImagery/TapestryVersion001.png" class="exclude-zoom" alt="Image 2" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer002B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0020000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene0000002Placard002('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0020000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene0000002Placard002('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!--
                                <div class="CenterBottomStoreContainer0000002 CenterBottomStoreContainer0020000002" id="textContainerForScene0000002Placard002Title" style="grid-row: 1; grid-column: 1 / span 9; flex: 0 0 135%; display: flex; font-size: 10px; transform: scale(0.8) !important; margin-left: -10px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold; position: relative; top: 55px; left: 25px;">
                                    Help Ukraine Buy More Ammo- over at:<br>(Sold Ukranian Posters- Helps Ukraine-<br>Buy More Ammo)
                                </div>
                                -->

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0020000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
                                    <button id="UkraineWebsiteButton0000002" style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 145px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        &nbsp;u24.gov.ua
                                    </button>
                                </div>
                                -->
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0020000002" style="grid-row: 2; grid-column: 3; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: 75px !important; position: relative; top: 65px;">
                                    <button id="UStoreButton005.001AAAAA" data-sku="UStoreButton005.001AAAAA"  style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 205px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        +$1,499.95 BYO Tapestry &#128722;
                                    </button>
                                </div>

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0010000002" id="UkranianButtonContainer0000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0000002-popup-description">
                                            <div id="FolderContainerForEyeButton0000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0000002" onclick="showTabEyeButton0000002('ART0000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>


                    <!-- 3 Sided Store- Placard 3 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0030000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer003A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0000002" src="/StoreProductsAndImagery/UminionUversion001.png" alt="Image 3" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer003B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0030000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene003Placard003('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0030000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene003Placard003('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!--
                                <div class="CenterBottomStoreContainer0000002 CenterBottomStoreContainer0030000002" id="textContainerForScene003Placard003Title" style="grid-row: 1; grid-column: 1 / span 9; flex: 0 0 135%; display: flex; font-size: 10px; transform: scale(0.8) !important; margin-left: -10px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold; position: relative; top: 55px; left: 25px;">
                                    Help Ukraine Buy More Ammo- over at:<br>(Sold Ukranian Posters- Helps Ukraine-<br>Buy More Ammo)
                                </div>
                                -->

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0030000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
                                    <button id="UkraineWebsiteButton0000002" style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 145px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        &nbsp;u24.gov.ua
                                    </button>
                                </div>
                                -->
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0030000002" style="grid-row: 2; grid-column: 3; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: 75px !important; position: relative; top: 65px;">
                                    <button id="UStoreButton005.003B.03" data-sku="UStoreButton005.003B.03"  
    style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 195px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;"
    onclick="window.open('https://www.patreon.com/Uminion', '_blank');">
    +$7.95 Monthly Subscription to Union News &#128722;
</button>

                                </div>

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0030000002" id="UkranianButtonContainer0030000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0030000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0030000002-popup-description">
                                            <div id="FolderContainerForEyeButton0030000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0030000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0030000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0030000002" onclick="showTabEyeButton0030000002('ART0030000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>


                    <!-- 3 Sided Store- Placard 4 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0040000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer004A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0040000002" src="/StoreProductsAndImagery/tshirtsversion002.png" alt="Image 4" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0040000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer004B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0040000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene004Placard004('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0040000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene004Placard004('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!-- Removed text section here -->

                                <div class="ButtonContainer0000002 ButtonContainer0040000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
    <button id="UStoreButton005.006C.01" data-sku="UStoreButton005.006C.01"  
        onclick="window.open('https://uminion.com/product/custom-u-t-shirt/', '_blank');" 
        style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; max-height: 45px; min-width: 145px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
        +$24.95 Uminion U-Tshirt &#128722;
    </button>
    
    <div id="dropdownContainer" style="display: flex; flex-direction: column; align-items: flex-start;">
        <!-- Dropdown menu commented out for future use -->
        <!-- 
        <select id="dropdownMenu24" onchange="logSizeChoice(this.value)" style="display: none; position: absolute; bottom: 100%; left: 15px; margin-bottom: 10px;">
            <option disabled selected>Sizes</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="XXXL">XXXL</option>
        </select>
        <select id="dropdownMenuQuantity" onchange="logQuantityChoice(this.value)" style="display: none; position: absolute; bottom: 100%; left: 80px; margin-bottom: 10px;">
            <option disabled selected>How Many?</option>
        </select>
        <button id="ShoppingCartForTshirtOn3SidedBillBoardsPlacard004" onclick="logChoicesAndHideElements()" style="display: none; position: absolute; bottom: 100%; left: 210px; margin-bottom: 10px; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
            &#128722;
        </button>
        -->
    </div>
</div>




                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0040000002" style="grid-row: 2; grid-column: 3; flex: 0 0 9%; display: flex; transform: scale(0.7) !important; margin-left: -10px !important; position: relative; top: 66px;">
                        <button id="UStoreButton005.007C.02" data-sku="UStoreButton005.007C.02"  
    style="display: flex; align-items: center; justify-content: center; width: 100%; min-width: 145px; min-height: 45px; max-height: 45px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #A9A9A9 !important; color: #D3D3D3 !important; border-radius: 5px; cursor: not-allowed;" 
    disabled>
    +$29.95 Custom U-Tshirt &#128722;
</button>
                        <div id="dropdownContainerCustom" style="display: none; gap: 10px; position: absolute; bottom: 100%; left: -85px; margin-bottom: 10px;">
                            <select id="dropdownMenuHowMany" onchange="logQuantityChoiceForPlacard004sCustomTshirt(this.value)" style="display: none; position: absolute; bottom: 150%; left: 25px; margin-bottom: 10px;">
                                <option disabled selected>How Many?</option>
                            </select>
                            <select id="dropdownMenuLeft" onchange="logChoiceForPlacard004sCustomTshirt('TshirtColor', this.value)">
                                <option disabled selected>TshirtColor</option>
                                <option value="black">Black</option>
                                <option value="red">Red</option>
                                <option value="yellow">Yellow</option>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="orange">Orange</option>
                            </select>
                            <button id="ShoppingCartForCUSTOMTshirtOn3SidedBillBoardsPlacard004" onclick="logChoicesAndHideElementsForPlacard004sCustomTshirt()" style="display: none; position: absolute; bottom: 150%; left: 145px; margin-bottom: 10px; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                &#128722;
                            </button>
                            <select id="dropdownMenuCenter" onchange="logChoiceForPlacard004sCustomTshirt('LogoColor', this.value)">
                                <option disabled selected>LogoColor</option>
                                <option value="orange">Orange</option>
                                <option value="red">Red</option>
                                <option value="yellow">Yellow</option>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="black">Black</option>
                                <option disabled>Sapphire U</option>
                            </select>
                            <select id="dropdownMenuRight" onchange="logSizeChoiceForPlacard004sCustomTshirt(this.value)">
                                <option disabled selected>Sizes</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                                <option value="XXXL">XXXL</option>
                            </select>
                        </div>
                    </div>

                                



                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0040000002" id="UkranianButtonContainer0040000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0040000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0040000002-popup-description">
                                            <div id="FolderContainerForEyeButton0040000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0040000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0040000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0040000002" onclick="showTabEyeButton0040000002('ART0040000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>



                    <!-- 3 Sided Store- Placard 5 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0050000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer005A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0050000002" src="/StoreProductsAndImagery/UminionCardVersion001.png" alt="Image 5" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0050000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer005B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0050000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene005Placard005('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0050000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene005Placard005('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!--
                                <div class="CenterBottomStoreContainer0000002 CenterBottomStoreContainer0050000002" id="textContainerForScene005Placard005Title" style="grid-row: 1; grid-column: 1 / span 9; flex: 0 0 135%; display: flex; font-size: 10px; transform: scale(0.8) !important; margin-left: -10px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold; position: relative; top: 55px; left: 25px;">
                                    Help Ukraine Buy More Ammo- over at:<br>(Sold Ukranian Posters- Helps Ukraine-<br>Buy More Ammo)
                                </div>
                                -->

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0050000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
                                    <button id="UkraineWebsiteButton0050000002" style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 145px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        &nbsp;u24.gov.ua
                                    </button>
                                </div>
                                -->
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0050000002" style="grid-row: 2; grid-column: 3; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: 75px !important; position: relative; top: 65px;">
                                    <button id="UStoreButton005.008D.01" data-sku="UStoreButton005.008D.01"  style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 215px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        +$14.95 Official Union Card (To Help Prove you're a Member) &#128722;
                                    </button>
                                </div>

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0050000002" id="UkranianButtonContainer0050000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0050000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0050000002-popup-description">
                                            <div id="FolderContainerForEyeButton0050000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0050000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0050000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0050000002" onclick="showTabEyeButton0050000002('ART0050000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>


                    <!-- 3 Sided Store- Placard 6 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0060000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer006A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0060000002" src="/StoreProductsAndImagery/Tshirtbatchversion001.png" alt="Image 6" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0060000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer006B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0060000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene006Placard006('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0060000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene006Placard006('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!-- Removed text section here -->

                                <div class="ButtonContainer0000002 ButtonContainer0060000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
    <button id="UStoreButton005.009C.03" data-sku="UStoreButton005.009C.03"  
        onclick="window.open('https://uminion.com/product/10-random-union-u-t-shirt-bundle/', '_blank');" 
        style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; max-height: 45px; min-width: 165px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
        +$199.95 10 Random U-Tshirt Bundle &#128722;
    </button>

    <!-- Dropdown functionality commented out for future use -->
    <!-- 
    <select id="dropdownMenuHowMany006" onchange="logChoiceForPlacard006('HowMany', this.value)" style="display: none; position: absolute; bottom: 125%; left: -30px; margin-bottom: 10px;">
        <option disabled selected>How Many?</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="100">100</option>
        <option value="250">250</option>
        <option value="500">500</option>
        <option value="1000">1,000</option>
        <option value="10000">10,000</option>
    </select>
    <select id="dropdownMenu200" onchange="logChoiceForPlacard006('Size', this.value)" style="display: none; position: absolute; bottom: 125%; left: 85px; margin-bottom: 10px;">
        <option disabled selected>Sizes</option>
        <option value="S">S</option>
        <option value="M">M</option>
        <option value="L">L</option>
        <option value="XL">XL</option>
        <option value="XXL">XXL</option>
        <option value="XXXL">XXXL</option>
    </select>
    <button id="ShoppingCartForBULKTshirtOn3SidedBillBoardsPlacard006" onclick="logChoicesAndHideElementsForPlacard006()" style="display: none; position: absolute; bottom: 125%; left: 160px; margin-bottom: 10px; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
        &#128722;
    </button>
    -->
</div>

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>



                    <!-- 3 Sided Store- Placard 7 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0070000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer007A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0070000002" src="/StoreProductsAndImagery/TapestryVersion001.png" class="exclude-zoom" alt="Image 7" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0070000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer007B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0070000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene007Placard007('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0070000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene007Placard007('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!--
                                <div class="CenterBottomStoreContainer0000002 CenterBottomStoreContainer0070000002" id="textContainerForScene007Placard007Title" style="grid-row: 1; grid-column: 1 / span 9; flex: 0 0 135%; display: flex; font-size: 10px; transform: scale(0.8) !important; margin-left: -10px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold; position: relative; top: 55px; left: 25px;">
                                    Help Ukraine Buy More Ammo- over at:<br>(Sold Ukranian Posters- Helps Ukraine-<br>Buy More Ammo)
                                </div>
                                -->

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0070000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
                                    <button id="UkraineWebsiteButton0070000002" style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 145px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        &nbsp;u24.gov.ua
                                    </button>
                                </div>
                                -->
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0070000002" style="grid-row: 2; grid-column: 3; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: 75px !important; position: relative; top: 65px;">
                                    <button id="UStoreButton005.002AAAAA" data-sku="UStoreButton005.002AAAAA"  style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 205px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        +$1,995.95 BYOCT (Build Your Own Custom Tapestry) &#128722;
                                    </button>
                                </div>

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0070000002" id="UkranianButtonContainer0070000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0070000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0070000002-popup-description">
                                            <div id="FolderContainerForEyeButton0070000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0070000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0070000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0070000002" onclick="showTabEyeButton0070000002('ART0070000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>



                    <!-- 3 Sided Store- Placard 8 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0080000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer008A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0080000002" src="/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png" alt="Image 8" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0080000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer008B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0080000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene008Placard008('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0080000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene008Placard008('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!--
                                <div class="CenterBottomStoreContainer0000002 CenterBottomStoreContainer0080000002" id="textContainerForScene008Placard008Title" style="grid-row: 1; grid-column: 1 / span 9; flex: 0 0 135%; display: flex; font-size: 10px; transform: scale(0.8) !important; margin-left: -10px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold; position: relative; top: 55px; left: 25px;">
                                    Help Ukraine Buy More Ammo- over at:<br>(Sold Ukranian Posters- Helps Ukraine-<br>Buy More Ammo)
                                </div>
                                -->

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0080000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
                                    <button id="UkraineWebsiteButton0080000002" style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 145px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        &nbsp;u24.gov.ua
                                    </button>
                                </div>
                                -->
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0080000002" style="grid-row: 2; grid-column: 3; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: 75px !important; position: relative; top: 65px;">
    <button id="UStoreButton005.004B.01"   
        onclick="window.open('https://uminion.com/cart/', '_blank');"
        style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 200px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background: linear-gradient(135deg, #da4453, #89216b) !important; color: #fff !important; border-radius: 5px;"> 
        <!-- i removed this data sku for now; since i changed this from a "Donate to The Uminion Union" Button and into a "Checkout button" until i figure out how to change it back to a "Donate Button" that works. the data sku works; but idk how to turn this thing into a working donation thing. -->
        &#128722 View Cart/Checkout
    </button> <!-- Older button's name was:>>> Donate To The Uminion Union <<< -->

</div>


                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0080000002" id="UkranianButtonContainer0080000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0080000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0080000002-popup-description">
                                            <div id="FolderContainerForEyeButton0080000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0080000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0080000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0080000002" onclick="showTabEyeButton0080000002('ART0080000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>


                        
                        

                    <!-- 3 Sided Store- Placard 9 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0090000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer009A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0090000002" src="/StoreProductsAndImagery/BraceletsVersion001.png" alt="Image 9" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0090000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer009B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0090000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene009Placard009('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0090000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene009Placard009('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!-- Removed text section here -->

                                <div class="ButtonContainer0000002 ButtonContainer0090000002" style="grid-row: 2; grid-column: 3 / span 6; display: flex; justify-content: space-around; transform: scale(0.70) !important; max-height: 25px !important; min-width: 250px !important; position: relative; top: 60px;">
                                    <button id="UStoreButton005.010D.02.01" data-sku="UStoreButton005.010D.02.01"  style="display: flex; align-items: center; justify-content: center; width: auto; min-height: 45px; max-height: 45px; min-width: 90px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        $9.95 Uminion Bracelet &#128722;
                                    </button>
                                    <button id="UStoreButton005.011D.02.07" data-sku="UStoreButton005.011D.02.07"  style="display: flex; align-items: center; justify-content: center; width: auto; min-height: 45px; max-height: 45px; min-width: 90px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #c0c0c0 !important; color: white !important; border-radius: 5px;" disabled>
                                        Sold Out- Custom
                                    </button>
                                    <button id="UStoreButton005.012D.02" data-sku="UStoreButton005.012D.02"  style="display: flex; align-items: center; justify-content: center; width: auto; min-height: 45px; max-height: 45px; min-width: 120px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        $19.95 Bundle: Uminion Card & Bracelet &#128722;
                                    </button>
                                </div> 

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0090000002" id="UkranianButtonContainer0090000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0090000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0090000002-popup-description">
                                            <div id="FolderContainerForEyeButton0090000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0090000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0090000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0090000002" onclick="showTabEyeButton0090000002('ART0090000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>



                    <!-- 3 Sided Store- Placard 10 of 10 --> 
                    <div class="placard0000002">
                        <div class="MainStoreContainer0000002 MainStoreContainer0100000002" style="width: 100%; position: absolute; transform: rotateY(0deg) translateZ(150px);">
                            <div class="TopStoreContainer0000002 TopStoreContainer010A0000002" style="width: 100%; height: 100%;">
                                <img id="initialImage0100000002" src="/StoreProductsAndImagery/UminionUversion002.png" alt="Image 10" style="width: 100%; height: 100%; object-fit: cover;">
                                <img id="singleImage0100000002" src="" alt="Single Image" style="display: none; width: 100%; height: auto; object-fit: cover;">
                            </div>
                            <div class="BottomStoreContainer0000002 BottomStoreContainer010B0000002" style="position: absolute; right: -9px !important; bottom: 85px !important; height: 18% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important; row-gap: 5px !important;">
                                <!-- Row 1 -->
                                <div class="LeftBottomStoreContainer0000002 LeftBottomStoreContainer0100000002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene010Placard010('up')">
                                    <!-- &#9650; U+25B2 BLACK UP-POINTING TRIANGLE -->
                                </div>
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0100000002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForScene010Placard010('down')">
                                    <!-- &#9660; U+25BC BLACK DOWN-POINTING TRIANGLE -->
                                </div>

                                <!--
                                <div class="CenterBottomStoreContainer0000002 CenterBottomStoreContainer0100000002" id="textContainerForScene010Placard010Title" style="grid-row: 1; grid-column: 1 / span 9; flex: 0 0 135%; display: flex; font-size: 10px; transform: scale(0.8) !important; margin-left: -10px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold; position: relative; top: 55px; left: 25px;">
                                    Help Ukraine Buy More Ammo- over at:<br>(Sold Ukranian Posters- Helps Ukraine-<br>Buy More Ammo)
                                </div>
                                -->

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0100000002" style="grid-row: 2; grid-column: 1; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important; position: relative; top: 60px;">
                                    <button id="UkraineWebsiteButton0100000002" style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 145px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;">
                                        &nbsp;u24.gov.ua
                                    </button>
                                </div>
                                -->
                                <div class="RightBottomStoreContainer0000002 RightBottomStoreContainer0100000002" style="grid-row: 2; grid-column: 3; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: 75px !important; position: relative; top: 65px;">
                                    <button id="UStoreButton005.004B.02" data-sku="UStoreButton005.004B.02"  
    style="display: flex; align-items: center; justify-content: center; width: 100%; min-height: 45px; min-width: 195px; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important; background-color: #007BFF !important; color: white !important; border-radius: 5px;"
    onclick="window.open('https://www.patreon.com/Uminion', '_blank');">
    +$3.95 Weekly Subscription to Union News &#128722;
</button>

                                </div>

                                <!--
                                <div class="ButtonContainer0000002 ButtonContainer0100000002" id="UkranianButtonContainer0100000002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right; padding-right: 20px;">
                                    <button id="EyeButton0100000002" class="hover-target" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(1.25) !important; position: relative; right: 15px;">
                                        &#128065;
                                        <span class="popup-description" id="eyebutton0100000002-popup-description">
                                            <div id="FolderContainerForEyeButton0100000002" class="container">
                                                <div class="tab-contents">
                                                    <div id="ART0100000002" class="tab-content" style="display: block;">
                                                        "Help Support Democracy in Ukraine. Help us Buy Ammo in Bulk.<br>(For every Ukranian Poster Bought, 95% of the profits will go support the War Effort.)"
                                                        <div id="images-container-for-eyebutton0100000002"></div>
                                                    </div>
                                                    <div class="tabs">
                                                        <header>
                                                            <div class="tab-head" data-tab="ART0100000002" onclick="showTabEyeButton0100000002('ART0100000002')">
                                                                <br>Ukraine
                                                            </div>
                                                        </header>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </button>
                                </div>
                                -->

                            </div>
                            <div class="arrow0000002 left-arrow0000002">&#9664;</div>
                            <div class="arrow0000002 right-arrow0000002">&#9654;</div>
                        </div>
                    </div>



                    
                </div> <!-- i believe this is the closing div for: "placard-container0000002" -->
            </div> <!-- i believe this is the closing div for: "scene0000002" -->


            <!-- TESTING TESTING:> "3sidedplacard" IS BEING PLACED ABOVE HERE! IT IS DISTINGUISHED WITH 0000002 INFO! -->



            <div class="innerDivBelowPlacard" style="position: absolute; top: 340px !important; left: 50%; transform: translateX(-50%);">
                <img src="/StoreProductsAndImagery/Banner002.png" id="BannerAtBottomOfPage" alt="Banner Image" style="max-height: 190px;">
            </div>


        </div> <!-- closing div for "containerForBannersABOVEandBELOWThe3BillboardPlacardThang" i believe -->
</div> <!-- closing div for "header-left-container" i believe -->




















            <!-- commented out signup/login form till im ready to implement it in -7:39am on 2/1/25 ***Upate:> Do i want this where banner002 presently is? underneath the 3billboard placard? -10:57am on 2/4/25 -->
            <?php if (empty($_SESSION["id"])): ?>
                <!-- Container for Sign-up and Log-in forms -->
            <!--
                <div class="SignUpAndLoginContainer">
                    <small style="display: block;">
                        Welcome to <span style="background: linear-gradient(10deg, #f7ec9c, #ff8651); -webkit-background-clip: text; color: transparent;">Uminion's</span> 
                        <span style="background: linear-gradient(60deg, hsl(202deg 100% 75%), hsl(205deg 100% 64%), hsl(230deg 100% 75%), hsl(270deg 100% 72%)); -webkit-background-clip: text; color: transparent;">Union Radio</span>!
                        No Account is Necessary to Anonymously Post/Listen to Union Radio.
                    </small>

            -->
                    <!-- Sign-up form -->
            <!--
                    <form class="" action="" method="post" autocomplete="off"> 
            -->
                        <!-- Input field for username -->

            <!--
                        <input type="text" name="username" id="username" placeholder="Username"> --> <!-- i did NOT add "required value" as taught by the database teacher for this connection. is that okay? -->
                        <!-- Input field for password -->
            <!--          <input type="password" name="pwd" id="pwd" placeholder="Password"> -->
                        <!-- Input field for email -->
                <!--        <input type="email" name="email" id="email" placeholder="E-mail"> -->
                        <!-- Submit button for the sign-up form -->
            <!--          <button type="submit" name="submit1" id="submit1">Sign-up</button> --> <!-- QUEST:> find all your 'submit' buttons and check out where they each lead just in case you accidentally call some to lead the wrong places -->
            <!--       </form>
                    <small style="display: block;">
                        Signing-up allows you to be able to upvote/downvote & enter *Restricted Areas*
                    </small> 
            -->
                    <!-- Log-in form -->
                <!--
                    <form class="" action="" method="post" autocomplete="off">
            -->
                        <!-- Input field for username or email -->
                <!--
                        <input type="text" name="usernameemail" id="usernameemail" placeholder="Username or Email">
            -->
                        <!-- Input field for password -->
                <!--
                        <input type="password" name="pwd" id="pwd" placeholder="Password"> 
            -->
                        <!-- Submit button for the log-in form -->

                <!--
                        <button type="submit" name="submit2" id="submit2">Log-in</button>
                    </form>
                    <small style="display: block;">
                        Logging-in allows you to be able to Delete Uploaded Content.
                    </small>
                </div>

            -->
            <?php endif; ?>















            <!-- Main container for the header-right section -->
            <div class="header-right-container" style="position: absolute; top: 0; right: 0; display: flex; flex-direction: column; justify-content: space-between; min-height: 500px;">



                <div id="headerRightContainerPre000" style="display: flex; flex-direction:column;">
                    <!-- Provided image to start and stop video recording -->
                    <img id="recordButton02" class="exclude-zoom" src="/includes/UnionRadioLogoVersion002ForUnionRadioWebsite.png" alt="Recording Button">
                    
                    <!-- Form for uploading videos -->
                    <form id="videoForm" action="includes/videosubmit.php" method="post" enctype="multipart/form-data">
                        <!-- Hidden input for the video file (commented-out label and input) -->
                        <!-- <label for="videoFile">Upload Video:</label> -->
                        <!-- <input type="file" name="videoFile" id="videoFile" accept="video/*" style="display:none;"><br><br> -->
                        
                        <!-- Hidden input for the video title -->
                        <label for="videoTitle" style="display:none;"></label> <!-- commented out label of: "Video Title:" when trying to make room in header -->
                        <input type="text" name="videoTitle" id="videoTitle" placeholder="Coming Soon- Video, like: Title of Video?" style="display:none; position: relative; top: 5px;"><br><br>

                        
                        <!-- Hidden input for the video description -->
                        <label for="videoDescription" style="display:none;"></label> <!-- commented out label of: "Video Description:" when trying to make room in header -->
                        <textarea name="videoDescription" id="videoDescription" placeholder="Coming Soon- Video, like: Description of Video? (max 1000 characters)" maxlength="1000" style="display:none; position: relative; top: -15px;"></textarea><br><br>


                        <!-- Hidden input for the logo file -->
                        <label for="logoFile" style="display:none; position: relative; top: -45px;">Upload Logo:</label>
                        <input type="file" name="logoFile" id="logoFile" accept="image/*" style="display:none; position: relative; top: -15px;"><br><br> <!-- is that how you change to only accept images? -->

                        
                        <!-- Hidden input for scheduling the video -->
                        <label for="scheduleTime" style="display:none; position: relative; top: -35px;">When to Air?</label> <!-- commented out label of: "Schedule Time:" when trying to make room in header -->
                        <input type="datetime-local" name="scheduleTime" id="scheduleTime" style="display:none; position: relative; top: -35px;">
                        
                        <!-- Hidden submit button -->
                        <button id="submitVideo" style="display: none; position: relative;">Submit Video</button>

                        
                        <!-- Hidden delete button -->
                        <!-- <button id="deleteButton" style="display: none;">Delete</button> -->
                        
                        <!-- Hidden save button -->
                        <button id="saveButton" style="display: none;" disabled>Save? (Coming Soon)</button>
                        
                        

                        
                        <!-- Hidden inputs for secondary titles and descriptions -->
                        <input type="hidden" name="secondaryTitle1" id="secondaryTitle1">
                        <input type="hidden" name="secondaryDescription1" id="secondaryDescription1">
                        <input type="file" name="secondaryLogo1" id="secondaryLogo1" style="display:none;">
                        <input type="hidden" name="secondaryTitle2" id="secondaryTitle2">
                        <input type="hidden" name="secondaryDescription2" id="secondaryDescription2">
                        <input type="file" name="secondaryLogo2" id="secondaryLogo2" style="display:none;">
                    </form>
                    
                    <!-- Video preview -->
                    <video id="preview" width="320" height="240" controls style="display:none; position: relative; top: -140px !important; z-index: 50000;"></video>
                    
                    <!-- Hidden buttons for camera controls -->
                    <button id="switchCameraButton" style="display:none; position: relative; top: -140px !important;">Switch Camera</button>
                    <button id="pauseButton" style="display:none; position: relative; top: -140px !important;">Pause</button>

                    <!-- <button id="stopRestartButton" style="display: none;">Stop & Restart</button> -->


                    <!-- Container for the preview -->
                    <div id="previewContainer"></div> <!-- if i have this right; this is for "when previewing videos that got recorded" like "would you like to submit video 1? video 2?" stuff like so" -12:20pm on 2/4/25 -->

                </div> <!-- Main container for the headerRightContainerPre000 section -->


                <div class="collectionOfNowPlayingComingUpNextAndRecentlyPlayedSection">
            
                            <!-- Container for "Now Playing" section -->
                            <div id="headerRightContainer001">
                                <h2 style="color: linear-gradient(10deg, #f7ec9c, #ff8651);">Now Playing:</h2>
                            </div>

                            <!-- Container for entries of what scheduled MP3s are "Now Playing" (used via JavaScript) -->
                            <div id="headerRightContainer002">
                            </div>

                            <!-- Container for playing entries clicked from the calendar (used via JavaScript) -->
                            <div id="headerRightContainer002.01">
                            </div>

                            <!-- Container for "Coming Up Next" section (used via JavaScript) -->
                            <div id="headerRightContainer002.02">
                                <!-- Video will be played here -->
                                <video id="videoPlayer" controls style="width: 100%; max-width: 600px; display: none;"></video>
                            </div>

                            <!-- Container for "Now Playing" and Channels sections -->
                            <div class="NowPlayingAndChannelContainer" display="flex;" flex-direction="row;">
                                <!-- Left side container for "Coming Up Next" header and entries -->
                                <div id="headerRightContainer003">
                                    <h3 id="comingUpNextHeader" style="display: none; background: linear-gradient(45deg, #ff7f50, #ffa07a); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                        Coming Up Next:
                                    </h3>
                                    <div id="comingUpNextEntries"></div>
                                </div>
                                <!-- Container for Channels content (dynamically added) -->
                                <div id="Channels">
                                </div> <!-- closing div for the channels section -->                      
                            </div> <!-- closing div for the nowplayingandchannelcontainer section -->

                            <!-- Container for the next scheduled MP3s "Now Playing" (used via JavaScript) -->
                            <div id="headerRightContainer004">
                            </div>

                            <!-- Container for recently played entries -->
                            <div class="RecentlyPlayedContainer">
                                <div id="headerRightContainer005">
                                    <h3 id="recentlyPlayedHeader" style="display: none; background: linear-gradient(225deg, #ffc0cb, #ff69b4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Recently Played:</h3>
                                    <div id="recentlyPlayedEntries"></div>
                                </div>
                                <!-- Additional container for future use -->
                                <div id="headerRightContainer006">
                                </div>
                            </div>

                </div>








            </div> <!-- Main container for the header-right-container section -->

            <!-- Main container for the header right section -->
            <div id="headerRightContainer000" style="display: flex; flex-direction: row; position: absolute; top: 15px; left: 200px;">


                <!-- Menu container with icons to toggle the dropdown -->
                <div class="menu-container">
                    <div class="menu-icon" onclick="toggleDropdown()"></div>
                    <div class="menu-icon" onclick="toggleDropdown()"></div>
                    <div class="menu-icon" onclick="toggleDropdown()"></div>
                </div>
                <!-- Dropdown menu with various links -->
                <ul class="dropdown" id="dropdownMenu">
                    <li><a href="">UnionRadio</a></li>
                    <li><a href="UnionChatRooms.php">*ChatRooms*</a></li>
                    <li><a href="includes/logout.php">Logout</a></li>
                    <li><a href="#" id="clearSingleEntry" onclick="enableSingleEntryDeletion()">Clear Single Calendar or Archive Entry?</a></li>
                    <li><a href="#" id="clearAllCalendar" onclick="clearAllCalendarEntries()">Clear All Calendar Entries?</a></li>
                    <li><a href="#" id="clearAllArchive" onclick="clearAllArchiveEntries()">Clear All Archive Entries?</a></li>
                </ul>
                <!-- Check if the user is logged in by verifying the session ID -->
                <?php if (!empty($_SESSION["id"])): ?>
                <!-- Welcome message for the logged-in user -->
                <div id="WelcomeSignForFrontPage"> Welcome <?php echo $row["username_Uminion"];?> </div> <!-- $row is the connection to the MySQL database, calling the person's username -->
                    <!-- Additional dropdown menu for logged-in user -->
                    <ul class="dropdown" id="dropdownMenu">
                        <li><a href="#">Clear an Entry?</a></li>
                        <li><a href="#">Clear All Entries?</a></li>
                    </ul>
                <?php endif; ?>
            </div>

            
           


</header>


<!-- Main container for the body section -->
<div class="body-container" id="BodyContainer">
    <!-- Container for the schedule section -->
    <div class="schedule-container" id="scheduleContainer">
        <!-- Calendar grid will be dynamically generated here -->
    </div>
</div>

<!-- Main container for the footer section -->
<footer class="footer-container">

    <div class="archive-container">
        <!-- Archive container (currently only has the top archive container) -->

        <div class="top-archive-container">
            <!-- This only has a popup at the moment -->

            <!-- Popup container -->
            <div class="popup">
                <div class="tabs">
                    <!-- Container for the tabs -->
                    <div class="tab-container">
                        


<!-- Note:> Some of these are out of order. this is because i 'coming sooned' a lot of them. and reorganized the order via removing repeats. on 5:12am on 2/1/25-->

<!-- Radio button for "Historical Archive" tab ***Update:> After being moved to the top of the list, "Historical Arhive has been renamed to "Archive""-->
<input type="radio" id="tab6" name="tab" checked="true" />
<!-- Label for "Historical Archive" tab -->
<label for="tab6" style="
    background: linear-gradient(10deg, #02ce85, #02ceab);
    -webkit-background-clip: text;
    color: transparent;">
    Archive:
</label>
<!-- Container for the content of "Historical Archive" tab -->
<div class="text-container text-container-6" id="bottomArchiveContainer006">
    <!-- "Place Data From Database in here" -->
</div>













                        <!-- Radio button and label for the "Most Upvoted" tab -->
                        <input type="radio" id="tab2" name="tab" />
                        <label for="tab2" style=
                            "background: linear-gradient(10deg, #02ce85, #02ceab);
                            -webkit-background-clip: text;
                            color: transparent;">
                            Most Upvoted:
                        </label>
                        <!-- Container for the content of the "Most Upvoted" tab -->
                        <div class="text-container text-container-2" id="bottomArchiveContainer002">
                            <!-- "Place Specific Data From Database in here" -->
                        </div>









<!-- Radio button for "Random" tab -->
<input type="radio" id="tab10" name="tab" />
<!-- Label for "Random" tab -->
<label for="tab10" style=
    "background: linear-gradient(10deg, #02ce85, #02ceab);
    -webkit-background-clip: text;
    color: transparent;">
    Random:
</label>
<!-- Container for the content of "Random" tab -->
<div class="text-container text-container-10" id="bottomArchiveContainer010">
    <!-- "Place Random Data Items From Database in here" -->
</div>








<!-- Radio button for "This (Y)'s Archive" tab -->
<input type="radio" id="tab4" name="tab" />
<!-- Label for "This (Y)'s Archive" tab -->
<label for="tab4" style=
    "background: linear-gradient(10deg, #02ce85, #02ceab);
    -webkit-background-clip: text;
    color: transparent;">
    Coming Soon:
</label>
<!-- Container for the content of "This (Y)'s Archive" tab -->
<div class="text-container text-container-4">
    Broadcasting Channels <!-- ***Quest:> Fill this in please <3-->
</div>





                        <!-- Radio button and label for the "Recently Played" tab -->
                        <input type="radio" id="tab3" name="tab" />
                        <label for="tab3" style=
                            "background: linear-gradient(10deg, #02ce85, #02ceab);
                            -webkit-background-clip: text;
                            color: transparent;">
                            Coming Soon:
                        </label>
                        <!-- Container for the content of the "Recently Played" tab -->
                        <div class="text-container text-container-3" id="bottomArchiveContainer003">
                            <!-- "Place Recent Data From Database in here" -->
                        </div>


<!-- Radio button for "Last (Y)'s Archive" tab -->
<input type="radio" id="tab5" name="tab" />
<!-- Label for "Last (Y)'s Archive" tab -->
<label for="tab5" style=
    "background: linear-gradient(10deg, #02ce85, #02ceab);
    -webkit-background-clip: text;
    color: transparent;">
    Coming Soon:
</label>
<!-- Container for the content of "Last (Y)'s Archive" tab -->
<div class="text-container text-container-5">
    Personalized Radio/Music/Ppl Feed <!-- ***Quest:> Fill this in please <3-->
</div>






                        <!-- Radio button and label for the "Archive" tab -->
                        <input type="radio" id="tab1" name="tab"  />
                        <label for="tab1" style=
                            "background: linear-gradient(10deg, #02ce85, #02ceab);
                            -webkit-background-clip: text;
                            color: transparent;">
                            Coming Soon: <!--QUEST:> Rename to "UserSub before launch please" =D! -->
                        </label>
                        <!-- Container for the content of the "Archive" tab -->
                        <div class="text-container text-container-1" id="bottomArchiveContainer">
                            <!-- Played MP3s will be listed here -->
                        </div>












<!-- Radio button for "Yday's Archive" tab -->
<input type="radio" id="tab7" name="tab" />
<!-- Label for "Yday's Archive" tab -->
<label for="tab7" style=
    "background: linear-gradient(10deg, #02ce85, #02ceab);
    -webkit-background-clip: text;
    color: transparent;">
    Coming Soon:
</label>
<!-- Container for the content of "Yday's Archive" tab -->
<div class="text-container text-container-7">
    Followers & Followings <!-- ***Quest:> Fill this in please <3-->
</div>

<!-- Radio button for "Tomorrow's Archive" tab -->
<input type="radio" id="tab8" name="tab" />
<!-- Label for "Tomorrow's Archive" tab -->
<label for="tab8" style=
    "background: linear-gradient(10deg, #02ce85, #02ceab);
    -webkit-background-clip: text;
    color: transparent;">
    Coming Soon:
</label>
<!-- Container for the content of "Tomorrow's Archive" tab -->
<div class="text-container text-container-8">
    Community Recommended Features! <!-- ***Quest:> Fill this in please <3-->
</div>


              <!-- Radio button for "Recent" tab -->
<input type="radio" id="tab9" name="tab" />
<!-- Label for "Recent" tab -->
<label for="tab9" style=
    "background: linear-gradient(10deg, #02ce85, #02ceab);
    -webkit-background-clip: text;
    color: transparent;">
    Coming Soon:
</label>
<!-- Container for the content of "Recent" tab -->
<div class="text-container text-container-9">
    Union Chat! <!-- ***Quest:> Fill this in please <3-->
</div>














<!-- Ending div for "div class tab container" -->
</div>

<!-- Marker div (likely helps the tab pick the right text container) -->
<div class="marker">
    <div id="top"></div>
    <div id="bottom"></div>
</div>

<!-- Ending div for "div tabs container" -->
</div>

<!-- Ending div for "popup" -->
</div>

<!-- Ending div for "top archive container" -->
</div>


<div class="footer-container-for-bug-and-neighbors">

    <!-- View Cart/Checkout -->
    <button id="ViewCartButton" onclick="window.open('https://uminion.com/cart/', '_blank');"
    style="display: flex; align-items: center; justify-content: center; min-height: 45px; min-width: 165px; padding: 0.5em; box-sizing: border-box; background: linear-gradient(135deg, #da4453, #89216b) !important; color: #fff !important; border-radius: 5px; transform: scale(0.7);">
    &#128722 View Cart/Checkout
</button>


    <a href="https://WeBuildWebsitesAndApps.com" class="footer-link-for-bug-and-neighbors" style="color: gray; transform: scale(0.7); text-decoration: none;" 
        onmouseover="this.style.color='#45a049';" onmouseout="this.style.color='gray';">
        Website Built By: "<span style="text-decoration: underline;">WeBuildWebsitesAndApps.com</span>"
    </a>

    <a href="#" class="footer-link-for-bug-and-neighbors footer-link" style="color: gray; text-decoration: none; transform: scale(0.7);">
        Terms of Service & Privacy Policy
    </a>

    <img id="bugReportImage" src="/includes/ReportABugImage001.png" alt="Report a Bug" class="footer-image-for-bug exclude-zoom" style="width: 50px; height: 50px; cursor: pointer;">
</div>

<!-- Toast Container for Bug Image -->
<div id="toastcontainerforbugimage" class="toast-container-for-bug-image"></div>



<!-- Ending div for "Archive Container" -->
</div>

<!-- note to self. if i add stuff IN THIS LINE it MIGHT create a banner like opportunity, but can, also, mess with archive and store section too.) -->




            <div class="extra-content-container"> <!-- This is where i'm putting up my 'store' (20billboard thang) -->

                <!-- Quest:> Create a reality where every now and then someone can click, ANOTHER ARROW, that shows you "DIFF STORES" and "Above this billboard" announces "what type of store this is", so that way, there's arrows next to that, that will advertise diff products. you know? =) -10:21pm on 11/9/24 -->


    <!-- Unlock this code to see more -->                 <div class="scene">

                        <div class="placard-container">

                        <div class="placard" id="placard001" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo001.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer001" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">                                
        <div class="TopStoreContainer TopStoreContainer001A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>
        <div class="BottomStoreContainer BottomStoreContainer001B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft001" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard001('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft001" id="textContainer001" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #1 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft001" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard001('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter001" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.013.02A" data-sku="UStoreButton005.013.02A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight001" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight001" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight001" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>





                        <div class="placard" id="placard002" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo002.02.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer002" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer002A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer002B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft002" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard002('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft002" id="textContainer" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #2 of 9: <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft002" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard002('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter002" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.014.03A"  data-sku="UStoreButton005.014.03A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight002" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight002" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight002" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>





<div class="placard" id="placard003" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo003.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer003" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer003A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer003B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft003" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard003('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft003" id="textContainer003" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #3 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft003" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard003('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter003" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.015.02A" data-sku="UStoreButton005.015.02A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight003" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight003" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight003" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>


<div class="placard" id="placard004" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo004.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer004" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer004A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer004B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft004" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard004('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft004" id="textContainer004" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #4 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft004" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard004('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter004" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.016.02A" data-sku="UStoreButton005.016.02A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight004" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight004" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight004" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>




<div class="placard" id="placard005" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo005.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer005" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer005A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer005B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft005" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard005('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft005" id="textContainer005" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #5 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft005" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard005('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter005" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.017.02A" data-sku="UStoreButton005.017.02A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight005" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight005" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight005" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



<div class="placard" id="placard006" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo006.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer006" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer006A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer006B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft006" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard006('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft006" id="textContainer006" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #6 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft006" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard006('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter006" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.018.02A" data-sku="UStoreButton005.018.02A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight006" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight006" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight006" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



<div class="placard" id="placard007" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo007.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer007" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer007A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer007B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft007" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard007('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft007" id="textContainer007" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #7 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft007" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard007('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter007" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.019.02A"  data-sku="UStoreButton005.019.02A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight007" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight007" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight007" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



                            
<div class="placard" id="placard008" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo008.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer008" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer008A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer008B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft008" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard008('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft008" id="textContainer008" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #8 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft008" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard008('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter008" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.020.02A" data-sku="UStoreButton005.020.02A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight008" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight008" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight008" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>


<div class="placard" id="placard009" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo009.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer009" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer009A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer009B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft009" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard009('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft009" id="textContainer009" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #9 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft009" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard009('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter009" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.021.01A" data-sku="UStoreButton005.021.01A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight009" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight009" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight009" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



<div class="placard" id="placard010" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo010.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer010" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer010A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer010B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft010" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard010('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft010" id="textContainer010" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #10: <br>"Union Hall" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft010" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard010('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter010" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.022.01A"  data-sku="UStoreButton005.022.01A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight010" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight010" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight010" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>




<div class="placard" id="placard011" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo011.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer011" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer011A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer011B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft011" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard011('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft011" id="textContainer011" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #11: <br>"Union Waterfall" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft011" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard011('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter011" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.023.01A" data-sku="UStoreButton005.023.01A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight011" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight011" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight011" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



<div class="placard" id="placard012" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo012.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer012" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer012A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer012B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft012" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard012('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft012" id="textContainer012" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #12: <br>"Union Event" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft012" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard012('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter012" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.024.01A"  data-sku="UStoreButton005.024.01A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight012" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight012" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight012" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



                        <div class="placard" id="placard013" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo013.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer013" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer013A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer013B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft013" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard013('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft013" id="textContainer013" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #13: <br>"Union Support" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft013" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard013('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter013" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.025.02A" data-sku="UStoreButton005.025.02A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight013" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight013" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight013" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>


<div class="placard" id="placard014" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo014.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer014" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer014A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer014B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft014" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard014('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft014" id="textContainer014" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #14: <br>"Union News" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft014" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard014('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter014" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.026.01A"  data-sku="UStoreButton005.026.01A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight014" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight014" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight014" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>




<div class="placard" id="placard015" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo015.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer015" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer015A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer015B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft015" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard015('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft015" id="textContainer015" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #15: <br>"Union Radio" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft015" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard015('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter015" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.027.01A"  data-sku="UStoreButton005.027.01A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight015" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight015" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight015" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



<div class="placard" id="placard016" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo016.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer016" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer016A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer016B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft016" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard016('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft016" id="textContainer016" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #16: <br>"Union Drive" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft016" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard016('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter016" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.028.01A" data-sku="UStoreButton005.028.01A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight016" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight016" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight016" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



<div class="placard" id="placard017" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo017.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer017" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer017A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer017B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft017" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard017('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft017" id="textContainer017" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #17: <br>"Union Archive & Education" -2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft017" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard017('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter017" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.029.01A"  data-sku="UStoreButton005.029.01A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight017" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight017" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight017" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>


<div class="placard" id="placard018" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo018.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer018" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer018A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer018B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft018" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard018('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft018" id="textContainer018" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #18: <br>"Union Tech" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft018" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard018('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter018" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.030.01A"  data-sku="UStoreButton005.030.01A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight018" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight018" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight018" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



                            <div class="placard" id="placard019" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo019.00.2024Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer019" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer019A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer019B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft019" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard019('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft019" id="textContainer019" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #19: <br>"Union Politic" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft019" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard019('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter019" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.031.01A" data-sku="UStoreButton005.031.01A"  style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight019" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight019" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight019" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>



                        <div class="placard" id="placard020" style="max-width: 100%; background: url('/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png') no-repeat center center; background-size: cover; padding: 5px;">
    <div class="MainStoreContainer MainStoreContainer020" style="max-width: 100%; height: 100vh; display: flex; flex-direction: column; position: relative;">
        <div class="TopStoreContainer TopStoreContainer020A" style="position: absolute; top: 0; left: 0; width: 100%; height: 60%;">
            <!-- Background image is set on the placard, so no image tag is needed here -->
        </div>                        
        <div class="BottomStoreContainer BottomStoreContainer020B" style="position: absolute; right: -9px !important; bottom: 15px !important; height: 40% !important; display: grid; grid-template-rows: 1fr 0px !important; grid-template-columns: repeat(4, 1fr); gap: 0 !important;">
            <!-- Row 1 -->
            <div class="BottomStoreContainerTopHalfFarLeft BottomStoreContainerTopHalfFarLeft020" style="grid-row: 1; grid-column: 1 / span 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard020('up')">
                &#9650; <!-- U+25B2 BLACK UP-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerTopHalfNearLeft BottomStoreContainerTopHalfNearLeft020" id="textContainer020" style="grid-row: 1; grid-column: 2 / span 9; flex: 0 0 135%; display: flex; font-size: 12px; transform: scale(0.8) !important; margin-left: 0px !important; overflow: hidden; color: white !important; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-weight: bold;">
                Sister Union #00: <br>"Union HQ" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2025 Classic
            </div>
            
            <!-- Row 2 -->
            <div class="BottomStoreContainerBottomHalfLeft BottomStoreContainerBottomHalfLeft020" style="grid-row: 2; grid-column: 1; flex: 0 0 15%; display: flex; transform: scale(0.8) !important; margin-right: -20px !important; cursor: pointer;" onclick="changeImageForPlacard020('down')">
                &#9660; <!-- U+25BC BLACK DOWN-POINTING TRIANGLE -->
            </div>
            <div class="BottomStoreContainerCenterHalfCenter BottomStoreContainerCenterHalfCenter020" style="grid-row: 2; grid-column: 2; flex: 0 0 9%; display: flex; transform: scale(0.70) !important; margin-right: -45px !important;">
                <button id="UStoreButton005.000.02A"  data-sku="UStoreButton005.000.02A" style="display: flex; width: 100%; padding: 0.5em; box-sizing: border-box; transform: scale(0.70) !important;">
                    +&#128722; <!-- Plus sign and U+1F6D2 shopping trolley -->
                </button>
            </div>
            <div class="BottomStoreContainerCenterHalfNearRight BottomStoreContainerCenterHalfNearRight020" style="grid-row: 2; grid-column: 3; flex: 0 0 12%; display: flex; transform: scale(0.70) !important; margin-left: 23px !important; max-height: 25px !important; min-width: 60px !important;">
                <input type="number" style="width: 100%; padding: 0.5em; box-sizing: border-box;">
            </div>
            <div class="BottomStoreContainerCenterHalfRight BottomStoreContainerCenterHalfRight020" style="grid-row: 2; grid-column: 4; flex: 0 0 9%; display: flex; transform: scale(0.8) !important; margin-left: -10px !important;">
            </div>
            <div class="BottomStoreContainerCenterHalfFarRight BottomStoreContainerCenterHalfFarRight020" style="grid-row: 2; grid-column: 5; flex: 0 0 15%; display: flex; transform: scale(0.70) !important; margin-left: -28px !important; text-align: right;">
                $69.95
            </div>
        </div>
        <div class="arrow left-arrow">&#9664;</div>
        <div class="arrow right-arrow">&#9654;</div>
    </div>
</div>





                        </div> <!-- ending /div for "placard container" -->
                    </div>  <!-- ending /div for "scene" -->
                </div>  <!-- ending /div for "extra-content-container" -->
                    
            </footer>







<!--

Table of Contents for PLACARDS: (use this, to understsand what's connected to what.)


    
    
    UStoreButton004.X = Ukranian Related Wares and Products
    UStoreButton005.X = Uminion Union related wares and products
    
    UStoreButton004.001 = UkraineLogo001
    UStoreButton005.001 = Uminion BYO Tapestry (25 Posters)
    (the entry found (in XXX) here:> 001 002 003 after (UStoreButton005.XXX) i believe, is +1 per entry i make/find =). so CTRL+F the last number, to find the last entry in or so; for there shouldnt be any extras or so <3 -12:17am on 2/3/25)
    
    UStoreButton000.000A = $69.95 Poster
    UStoreButton000.000AA = $84.95 Poster
    UStoreButton000.000AAA = $99.95 Poster
    UStoreButton000.000AAAA = $124.95 Poster
    UStoreButton000.000AAAAA = $1,499.95 BYO Tapestry (25 Posters)
    UStoreButton000.000AAAAAA = $1,999.95 BYO Tapestry (All the Posters) (adjust price please accordingly)

    UStoreButton000.000B.01 = Donation to Uminion
    UStoreButton000.000B.02 = Weekly Subscription to Uminion News
    UStoreButton000.000B.03 = Monthly Subscription to Uminion News
    
    UStoreButton000.000C.01.A.B.C.D = Tshirt (Random) A = Size, B = Quantity, C = T-shirt Color, D = Logo Color (not sure how to plug in A B C D yet as of 12:28am on 2/3/25)
    UStoreButton000.000C.02.A.B.C.D = Tshirt (Custom) A = Size, B = Quantity, C = T-shirt Color, D = Logo Color (not sure how to plug in A B C D yet as of 12:28am on 2/3/25)
    UStoreButton000.000C.03.A.B.C.D = Tshirt (Bulk) A = Size, B = Quantity, C = T-shirt Color, D = Logo Color (not sure how to plug in A B C D yet as of 12:28am on 2/3/25)

    UStoreButton000.000D.01 = Union Card
    UStoreButton000.000D.02 = Union Card & Bracelet Combo
    UStoreButton000.000D.02.01 = Orange Bracelet
    UStoreButton000.000D.02.02 = Black Bracelet
    UStoreButton000.000D.02.03 = Orange Bracelet With Black Secondary Color/Font
    UStoreButton000.000D.02.04 = Black Bracelet With Orange Secondary Color/Font
    UStoreButton000.000D.02.05 = Gold Bracelet
    UStoreButton000.000D.02.06 = Gold Bracelet with Black Secondary Color/Font
    UStoreButton000.000D.02.07 = Custom/Special Bracelet


    (Note to self/cheat sheet:
    
    UStoreButton005.000.X = Posters/Products Related to: Sister Union #00 Specifically.
                    UStoreButton005.000.01 = 2024 Sister Union #00 Classic (iArt06,505.20)
                    UStoreButton005.000.02 = 2025 Sister Union #00 Classic (iArt06,505.20.01)
    UStoreButton005.013.X = Posters/Products Related to: Sister Union #01 Specifically.
                    UStoreButton005.013.01 = 2024 Sister Union #01 Classic (iArt06,505.02)
                    UStoreButton005.013.02 = 2025 Sister Union #01 Classic (iArt06,505.01)
    UStoreButton005.014.X = Posters/Products Related to: Sister Union #02 Specifically.
                    UStoreButton005.014.01 = 2024 Sister Union #02 Classic (iArt06,505.03)
                    UStoreButton005.014.02 = 2025 Sister Union #02 Classic (iArt06,505.03.01)
                    UStoreButton005.014.03 = 2025 Sister Union #02 Classic (iArt06,505.03.02)
                    UStoreButton005.014.04 = 2025 Sister Union #02 Classic (iArt06,505.03.03)
    UStoreButton005.015.X = Posters/Products Related to: Sister Union #03 Specifically.
                    UStoreButton005.015.01 = 2024 Sister Union #03 Classic (iArt06,505.04)
                    UStoreButton005.015.02 = 2025 Sister Union #03 Classic (iArt06,505.04.01)
                    UStoreButton005.015.03 = 2025 Sister Union #03 Classic (iArt06,505.04.02)
    UStoreButton005.016.X = Posters/Products Related to: Sister Union #04 Specifically.
                    UStoreButton005.016.01 = 2024 Sister Union #04 Classic (iArt06,505.05)
                    UStoreButton005.016.02 = 2025 Sister Union #04 Classic (iArt06,505.05.01)
    UStoreButton005.017.X = Posters/Products Related to: Sister Union #05 Specifically.
                    UStoreButton005.017.01 = 2024 Sister Union #05 Classic (iArt06,505.06)
                    UStoreButton005.017.02 = 2025 Sister Union #05 Classic (iArt06,505.06.01)
    UStoreButton005.018.X = Posters/Products Related to: Sister Union #06 Specifically.
                    UStoreButton005.018.01 = 2024 Sister Union #06 Classic (iArt06,505.07)
                    UStoreButton005.018.02 = 2025 Sister Union #06 Classic (iArt06,505.07.01)
                    UStoreButton005.018.03 = 2025 Sister Union #06 Classic (iArt06,505.07.02)
    UStoreButton005.019.X = Posters/Products Related to: Sister Union #07 Specifically.
                    UStoreButton005.019.01 = 2024 Sister Union #07 Classic (iArt06,505.09)
                    UStoreButton005.019.02 = 2025 Sister Union #07 Classic (iArt06,505.09.04)
                    UStoreButton005.019.03 = 2025 Sister Union #07 Classic (iArt06,505.09.01)
                    UStoreButton005.019.04 = 2025 Sister Union #07 Classic (iArt06,505.09.02)
                    UStoreButton005.019.05 = 2025 Sister Union #07 Classic (iArt06,505.09.03)
    UStoreButton005.020.X = Posters/Products Related to: Sister Union #08 Specifically.
                    UStoreButton005.020.01 = 2024 Sister Union #08 Classic (iArt06,505.08)
                    UStoreButton005.020.02 = 2025 Sister Union #08 Classic (iArt06,505.08.01)
                    UStoreButton005.020.03 = 2025 Sister Union #08 Classic (iArt06,505.08.02)
    UStoreButton005.021.X = Posters/Products Related to: Sister Union #09 Specifically.
                    UStoreButton005.021.01 = 2024 Sister Union #09 Classic (iArt06,505.10)
    UStoreButton005.022.X = Posters/Products Related to: Sister Union #10 Specifically.
                    UStoreButton005.022.01 = 2024 Sister Union #10 Classic (iArt06,505.11)
    UStoreButton005.023.X = Posters/Products Related to: Sister Union #11 Specifically.
                    UStoreButton005.023.01 = 2024 Sister Union #11 Classic (iArt06,505.12)
    UStoreButton005.024.X = Posters/Products Related to: Sister Union #12 Specifically.
                    UStoreButton005.024.01 = 2024 Sister Union #12 Classic (iArt06,505.13)
    UStoreButton005.025.X = Posters/Products Related to: Sister Union #13 Specifically.
                    UStoreButton005.025.01 = 2024 Sister Union #13 Classic (iArt06,505.14)
                    UStoreButton005.025.02 = 2025 Sister Union #13 Classic (iArt06,505.14.01)
    UStoreButton005.026.X = Posters/Products Related to: Sister Union #14 Specifically.
                    UStoreButton005.026.01 = 2024 Sister Union #14 (14.01) Classic (iArt06,505.15)
                    UStoreButton005.026.02 = 2025 Sister Union #14 Classic (iArt06,505.15.02)
                    UStoreButton005.026.03 = 2024 Sister Union #14.02 Propaganda (iArt06,505.15.00.01)
                    UStoreButton005.026.04 = 2024 Sister Union #14.03 Tips Tricks and Stories (iArt06,505.15.00.02)
    UStoreButton005.027.X = Posters/Products Related to: Sister Union #15 Specifically.
                    UStoreButton005.027.01 = 2024 Sister Union #15 Classic (iArt06,505.16) (Union Radio Logo- Audio)
                    UStoreButton005.027.02 = 2024 Sister Union #15.01 Classic (iArt06,505.22) (Union Radio Logo- Video (/Union Video/Union TV)/Uminion TV Network)
    UStoreButton005.028.X = Posters/Products Related to: Sister Union #16 Specifically.
                    UStoreButton005.028.01 = 2024 Sister Union #16 Classic (iArt06,505.17)
    UStoreButton005.029.X = Posters/Products Related to: Sister Union #17 Specifically.
                    UStoreButton005.029.01 = 2024 Sister Union #17 Classic (iArt06,505.18)
                    UStoreButton005.029.02 = 2024 Sister Union #17.01 Union Archive Classic (iArt06,505.18.00.01)
                    UStoreButton005.029.03 = 2024 Sister Union #17.02 Union Education Classic (iArt06,505.18.00.02)
    UStoreButton005.030.X = Posters/Products Related to: Sister Union #18 Specifically.
                    UStoreButton005.030.01 = 2024 Sister Union #18 Classic (iArt06,505.19)
    UStoreButton005.031.X = Posters/Products Related to: Sister Union #19 Specifically.
                    UStoreButton005.031.01 = 2024 Sister Union #19 Classic (iArt06,505.21)

    UStoreButton005.032.X = Posters/Products Related to: Sister Union #20 Specifically.
    UStoreButton005.033.X = Posters/Products Related to: Sister Union #21 Specifically.
    UStoreButton005.034.X = Posters/Products Related to: Sister Union #22 Specifically.
    UStoreButton005.035.X = Posters/Products Related to: Sister Union #23 Specifically.
    UStoreButton005.036.X = Posters/Products Related to: Sister Union #24 Specifically.
    

    
    )


    (Note to self: There is no "UStoreButton001.X to UStoreButton003.X because its original names was 'StoreButton001.X' but that was related to my WYS website/store products. and so i wanted to keep some general trend where my mind will know what products im talking about/looking at when i look at them; while at the same time, the "U" in front of: UStoreButton001.X will help me know its Uminion/Union Related =) -12:34am on 2/3/25)










***Note to self; create something similar to this:>>> via bringing in 001 and 003 from WYS place =) -12:45am on 2/3/25
    ***Update:> ****************Note to self of:>>>>>>>> "ImHereToAddStuffToMyStore Part 002 of 003" <<<<<<<<<< check out this commented out stuff here ^^^. it shares with you the different products and how to sell them. is it a wys product? a storytellingsalem product? an other? this list ^^^ is how to create it. next entry, ill show you how to plug em in:! -12:07am on 1/9/25


-->






<script>


// ***************************************** This area below, is for: "Audio implementation" (except, apparently: "Triggered AFTER DOM Loaded part 5,6,7,and 8, i believe, as of 11:53pm on 1/16/25") ******************************************************

//This list of content, is in the working audio version of "MergeThisVersion024" -Part A: -5:31pm on -1/16/25

let mp3Schedule = []; // This array helps you store scheduled audio entries
let mediaStream = null; // Variable to store the media stream
let mediaRecorder = null; // Declare a variable for the MediaRecorder (NOTE:> VIDEO DID NOT HAVE NULL; WORKING AUDIO DID; SO WE WENT WITH NULL; SINCE IT SEEMS TO COVER BOTH OR SO)
let audioChunks = []; // Array to store audio chunks during recording
let isMouseDown = false; // Flag to check if mouse button is pressed
let gifIndex = 0; // Index to keep track of the current GIF in rotation
const gifs = [ // Array of GIFs for recording animation
    "/includes/UminionRadioGIFversion01.gif",
    "/includes/UminionRadioGIFversion02.gif",
    "/includes/UminionRadioGIFversion03.gif",
    "/includes/UminionRadioGIFversion04.gif",
    "/includes/UminionRadioGIFversion05.gif"
];
let currentChannel = 1; // Variable to keep track of the current channel
let recentlyPlayed = []; // Array to keep track of recently played audios
let visibleCount = 10; // Initialize visibleCount with a default value



// ********DOM001************** Part 00


document.addEventListener("DOMContentLoaded", () => {
    // Event listener for when the DOM content is fully loaded























    // ********DOM001**************Part 1 (Checked: "Was, in, working audio")

    // Initialize media stream
    navigator.mediaDevices
        .getUserMedia({ audio: true }) // Request access to the user's microphone
        .then((stream) => {
            mediaStream = stream; // Store the media stream
        })
        .catch((error) => {
            console.error("Error accessing microphone:", error); // Handle errors accessing the microphone
        });












// ********DOM001**************Part 2 (Checked: "Was, in, working audio")


    // Handle recording with image
    const img = document.querySelector("#recordButton"); // Select the record button image
    if (img) {
        // Add event listener for mousedown event on the record button
        img.addEventListener("mousedown", () => {
            isMouseDown = true; // Set isMouseDown to true
            startRecording(); // Start recording audio
            playGifs(); // Play GIFs for recording animation
        });

        // Add event listener for mouseup event on the record button
        img.addEventListener("mouseup", () => {
            isMouseDown = false; // Set isMouseDown to false
            if (mediaRecorder) {
                mediaRecorder.stop(); // Stop the media recorder
                mediaRecorder.addEventListener("stop", handleRecordingStop); // Handle the stop event of the recorder
            }
        });

        // Add event listener for mouseleave event on the record button
        img.addEventListener("mouseleave", () => {
            if (isMouseDown) {
                isMouseDown = false; // Set isMouseDown to false
                if (mediaRecorder && mediaRecorder.state === "recording") {
                    mediaRecorder.stop(); // Stop the media recorder if it's recording
                }
            }
        });
    } else {
        console.error("Element with ID 'recordButton' not found."); // Handle case when record button is not found
    }















// ********DOM001**************Part 3 (Checked: "Was, in, working audio")

// Fetch files from the server
fetch('includes/fetchFiles.php')
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        if (data.status === "success" && data.files) {
            // Process the fetched files as needed
            data.files.forEach(file => {
                console.log('Fetched file:', file);
                // Here, you can perform operations with the fetched file data
            });
        } else {
            console.error('Failed to retrieve files: ' + data.message); // Log an error message if retrieval fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });










// ********DOM001**************Part 4 (Checked: "Was, in, working audio")


// Handle removing audio preview
const removeAudioBtn = document.getElementById("removeAudioBtn"); // Select the remove audio button
if (removeAudioBtn) {
    removeAudioBtn.addEventListener("click", () => {
        // Hide the audio preview
        document.getElementById("audioPreview").style.display = "none";
        // Enable the upload MP3 button
        document.getElementById("uploadMp3Btn").disabled = false;
        document.getElementById("uploadMp3Btn").style.backgroundColor = "";
        // Clear the audio source
        document.getElementById("recordedAudio").src = "";
        // Hide the MP3 details section
        document.getElementById("mp3Details").style.display = "none";
    });
} else {
    console.error("Element with ID 'removeAudioBtn' not found."); // Log an error if the button is not found
}











// ********DOM001**************Part 5 (Checked: "Was, in, working audio")



// i believe this is a repeat:>>>>>>>>> and only this line here:>>>>>>>>>>>>                    
// >>>>>>>>removed as of 6:48am on 1/23/25 generateSchedule(); // Ensure the schedule is generated on page load






















// ********DOM001**************Part 6  (Checked: "Was, in, working audio") should i test this without it being commented out? ***Update:> Tested it. didnt work. didnt unwind or whatever. 



// Note to self:> Hey my love, this stuff below is most likely really important. but right now, im looking for code thats creating duplicates. and this seems to be one of them. im looking for 2. lets call this XXX Part 1 of 3

// Fetch and display the scheduled MP3s from the database
// fetch('includes/getScheduledMp3s.php') // Fetch data from the specified URL
//     .then(response => response.json()) // Parse the response as JSON
//     .then(data => { // Handle the parsed data
//         if (data.status === "success" && data.mp3s) { // Check if the status is "success" and there are MP3s
//             data.mp3s.forEach(mp3 => { // Loop through each MP3
//                 const playTime = new Date(mp3.audio_scheduled_time_to_play).getTime(); // Convert the scheduled play time to a timestamp
//                 addMp3ToSchedule(mp3.id, mp3.audio_url, mp3.audio_title_user_uploaded, mp3.audio_description, playTime, mp3.audio_logo_url); // Add the MP3 to the schedule
//             });
//             updateNextMp3(); // Ensure the next MP3 is scheduled to play

//             // Setup channels for MP3s scheduled at the same time
//             const groupedByTime = {}; // Initialize an object to group MP3s by their scheduled time
//             data.mp3s.forEach(mp3 => { // Loop through each MP3 again
//                 const time = new Date(mp3.audio_scheduled_time_to_play).getTime(); // Convert the scheduled play time to a timestamp
//                 if (!groupedByTime[time]) { // If there is no entry for this time, create an empty array
//                     groupedByTime[time] = [];
//                 }
//                 groupedByTime[time].push(mp3); // Add the MP3 to the array for this time
//             });

//             Object.keys(groupedByTime).forEach(time => { // Loop through each time in the groupedByTime object
//                 setupChannels(groupedByTime[time]); // Setup channels for the MP3s scheduled at this time
//             });
//         } else {
//             console.error('Failed to retrieve scheduled MP3s: ' + data.message); // Log an error message if retrieval fails
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error); // Log an error message if there's an error during fetch
//     });













// ********DOM001**************Part 7 (Checked: "Was, in, working audio")




 // Fetch the popularity archive data from the server
 fetch('includes/getPopularityArchive.php')
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        if (data.status === "success" && data.audios) { // Check if the status is "success" and there are audio entries
            const popularityArchiveContainer = document.getElementById('bottomArchiveContainer002'); // Get the container for the popularity archive
            let visibleCount = 15; // Show first 15 entries by default

            function updatePopularityArchiveVisibility() {
                console.log("Managing popularity archive visibility");
                const archiveItems = document.querySelectorAll('#bottomArchiveContainer002 > div'); // Get all archive items
                const showButtonId = 'showMoreButtonPopularity'; // Set the ID for the "Show More" button

                archiveItems.forEach((item, index) => {
                    if (index < visibleCount) { // Show items within the visible count
                        item.style.display = 'block';
                    } else { // Hide items beyond the visible count
                        item.style.display = 'none';
                    }
                });

                const showMoreButton = document.getElementById(showButtonId); // Get the "Show More" button
                if (showMoreButton) {
                    showMoreButton.remove(); // Remove the button if it exists
                }

                if (archiveItems.length > visibleCount) { // Check if there are more items to show
                    const showMoreButton = document.createElement('button'); // Create the "Show More" button
                    showMoreButton.id = showButtonId;
                    showMoreButton.innerText = 'Show Next 15?';
                    showMoreButton.className = 'button-style'; // Apply the same button styling
                    showMoreButton.onclick = () => {
                        visibleCount += 15; // Increase the visible count by 15
                        updatePopularityArchiveVisibility(); // Update the visibility of archive items
                    };
                    popularityArchiveContainer.appendChild(showMoreButton); // Append the "Show More" button to the container
                }
            }

            // Populate the popularity archive
            data.audios.forEach(audio => {
                const archiveItem = document.createElement('div'); // Create a div for each audio entry
                const playedTime = audio.actualPlayedTime ? new Date(audio.actualPlayedTime).toLocaleString() : new Date(audio.scheduledTime).toLocaleString(); // Get the played time
                const endTime = audio.actualEndTime ? new Date(audio.actualEndTime).toLocaleString() : ''; // Get the end time if available
                
                archiveItem.innerHTML = `
                    <div>
                        <p>ID: ${audio.id}</p>
                        <p>
                            <button class="upvote" onclick="voteUp(${audio.id}, this)">⬆️</button>
                            <button class="downvote" onclick="voteDown(${audio.id}, this)">⬇️</button>
                            ${audio.title ? audio.title : ''}
                            <span class="total-votes">(${audio.totalVotes} votes)</span>
                        </p>
                        ${audio.description ? `<p>${audio.description}</p>` : ""}
                        ${audio.logoUrl ? `<img src="../uploads/${audio.logoUrl}" alt="Logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">` : ""}
                        <p>Played Time: ${playedTime}</p>
                        ${endTime ? `<p>Ended Time: ${endTime}</p>` : ""}
                        <audio src="../uploads/${audio.audioUrl}" controls></audio>
                    </div>
                `;
                popularityArchiveContainer.appendChild(archiveItem); // Append the audio entry to the container
            });

            // Manage the visibility of the popularity archive items
            updatePopularityArchiveVisibility(); // Call the function to update visibility
        } else {
            console.error('Failed to retrieve audio entries: ' + data.message); // Log an error message if retrieval fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });
















// ********DOM001**************Part 8 (Checked: "Was, in, working audio")




// Fetch and display the Recent Archive on page load
fetch('includes/getRecentArchive.php')
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        if (data.status === "success" && data.audios) { // Check if the status is "success" and there are audio entries
            const recentArchiveContainer = document.getElementById('bottomArchiveContainer003'); // Get the container for the recent archive

            // Populate the recent archive
            data.audios.forEach(audio => { // Loop through each audio entry
                const archiveItem = document.createElement('div'); // Create a div for each audio entry
                const scheduledTime = new Date(audio.scheduledTime).toLocaleString(); // Convert the scheduled time to a readable format
                
                archiveItem.innerHTML = `
                    <div>
                        <p>ID: ${audio.id}</p>
                        <p>${audio.title ? audio.title : ''}</p>
                        ${audio.description ? `<p>${audio.description}</p>` : ""}
                        ${audio.logoUrl ? `<img src="../uploads/${audio.logoUrl}" alt="Logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">` : ""}
                        <p>Scheduled Time: ${scheduledTime}</p>
                        <audio src="../uploads/${audio.audioUrl}" controls></audio>
                    </div>
                `;
                recentArchiveContainer.appendChild(archiveItem); // Append the audio entry to the container
            });
        } else {
            console.error('Failed to retrieve audio entries: ' + data.message); // Log an error message if retrieval fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });












// ********DOM001**************Part 9 (Checked: "Was, in, working audio")




// Fetch and display the Random Archive on page load
fetch('includes/getRandomArchive.php')
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        if (data.status === "success" && data.audios) { // Check if the status is "success" and there are audio entries
            const randomArchiveContainer = document.getElementById('bottomArchiveContainer010'); // Get the container for the random archive
            let visibleCount = 25; // Show first 25 entries by default

            function updateRandomArchiveVisibility() {
                console.log("Managing random archive visibility");
                const archiveItems = document.querySelectorAll('#bottomArchiveContainer010 > div'); // Get all archive items
                const showButtonId = 'showMoreButtonRandom'; // Set the ID for the "Show More" button

                archiveItems.forEach((item, index) => {
                    if (index < visibleCount) { // Show items within the visible count
                        item.style.display = 'block';
                    } else { // Hide items beyond the visible count
                        item.style.display = 'none';
                    }
                });

                const showMoreButton = document.getElementById(showButtonId); // Get the "Show More" button
                if (showMoreButton) {
                    showMoreButton.remove(); // Remove the button if it exists
                }

                if (archiveItems.length > visibleCount) { // Check if there are more items to show
                    const showMoreButton = document.createElement('button'); // Create the "Show More" button
                    showMoreButton.id = showButtonId;
                    showMoreButton.innerText = 'Show Next 25?';
                    showMoreButton.className = 'button-style'; // Apply the same button styling
                    showMoreButton.onclick = () => {
                        visibleCount += 25; // Increase the visible count by 25
                        updateRandomArchiveVisibility(); // Update the visibility of archive items
                    };
                    randomArchiveContainer.appendChild(showMoreButton); // Append the "Show More" button to the container
                }
            }

            // Populate the random archive
            data.audios.forEach(audio => { // Loop through each audio entry
                const archiveItem = document.createElement('div'); // Create a div for each audio entry
                const playedTime = audio.actualPlayedTime ? new Date(audio.actualPlayedTime).toLocaleString() : new Date(audio.scheduledTime).toLocaleString(); // Get the played time
                const endTime = audio.actualEndTime ? new Date(audio.actualEndTime).toLocaleString() : ''; // Get the end time if available
                
                archiveItem.innerHTML = `
                    <div>
                        <p>ID: ${audio.id}</p>
                        <p>
                            <button class="upvote" onclick="voteUp(${audio.id}, this)">⬆️</button>
                            <button class="downvote" onclick="voteDown(${audio.id}, this)">⬇️</button>
                            ${audio.title ? audio.title : ''}
                        </p>
                        ${audio.description ? `<p>${audio.description}</p>` : ""}
                        ${audio.logoUrl ? `<img src="../uploads/${audio.logoUrl}" alt="Logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">` : ""}
                        <p>Played Time: ${playedTime}</p>
                        ${endTime ? `<p>Ended Time: ${endTime}</p>` : ""}
                        <audio src="../uploads/${audio.audioUrl}" controls></audio>
                    </div>
                `;
                randomArchiveContainer.appendChild(archiveItem); // Append the audio entry to the container
            });

            // Manage the visibility of the random archive items
            updateRandomArchiveVisibility(); // Call the function to update visibility
        } else {
            console.error('Failed to retrieve audio entries: ' + data.message); // Log an error message if retrieval fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });










// ********DOM001**************Part 10 (Checked: "Was, in, working audio")


// Fetch and display the historical archive on page load
fetch('includes/getHistoricalArchive.php')
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        if (data.status === "success" && data.audios) { // Check if the status is "success" and there are audio entries
            const historicalArchiveContainer = document.getElementById('bottomArchiveContainer006'); // Get the container for the historical archive
            let visibleCount = 25; // Show first 25 entries by default

            function updateHistoricalArchiveVisibility() {
                console.log("Managing historical archive visibility");
                const archiveItems = document.querySelectorAll('#bottomArchiveContainer006 > div'); // Get all archive items
                const showButtonId = 'showMoreButtonHistorical'; // Set the ID for the "Show More" button

                archiveItems.forEach((item, index) => {
                    if (index < visibleCount) { // Show items within the visible count
                        item.style.display = 'block';
                    } else { // Hide items beyond the visible count
                        item.style.display = 'none';
                    }
                });

                const showMoreButton = document.getElementById(showButtonId); // Get the "Show More" button
                if (showMoreButton) {
                    showMoreButton.remove(); // Remove the button if it exists
                }

                if (archiveItems.length > visibleCount) { // Check if there are more items to show
                    const showMoreButton = document.createElement('button'); // Create the "Show More" button
                    showMoreButton.id = showButtonId;
                    showMoreButton.innerText = 'Show Next 25?';
                    showMoreButton.className = 'button-style'; // Apply the same button styling
                    showMoreButton.onclick = () => {
                        visibleCount += 25; // Increase the visible count by 25
                        updateHistoricalArchiveVisibility(); // Update the visibility of archive items
                    };
                    historicalArchiveContainer.appendChild(showMoreButton); // Append the "Show More" button to the container
                }
            }

            // Populate the historical archive
            data.audios.forEach(audio => { // Loop through each audio entry
                const archiveItem = document.createElement('div'); // Create a div for each audio entry
                const playedTime = audio.actualPlayedTime ? new Date(audio.actualPlayedTime).toLocaleString() : new Date(audio.scheduledTime).toLocaleString(); // Get the played time
                const endTime = audio.actualEndTime ? new Date(audio.actualEndTime).toLocaleString() : ''; // Get the end time if available
                
                console.log(audio.logoUrl); // Log the logo URL to the console for debugging

                archiveItem.innerHTML = `
                    <div>
                        <p>ID: ${audio.id}</p>
                        <p>
                            <button class="upvote" onclick="voteUp(${audio.id}, this)">⬆️</button>
                            <button class="downvote" onclick="voteDown(${audio.id}, this)">⬇️</button>
                            ${audio.title ? audio.title : ''}
                        </p>
                        ${audio.description ? `<p>${audio.description}</p>` : ""}
                        ${audio.logoUrl ? `<img src="../uploads/${audio.logoUrl}" alt="Logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">` : ""}
                        <p>Played Time: ${playedTime}</p>
                        ${endTime ? `<p>Ended Time: ${endTime}</p>` : ""}
                        <audio src="../uploads/${audio.audioUrl}" controls></audio>
                    </div>
                `;
                historicalArchiveContainer.appendChild(archiveItem); // Append the audio entry to the container
            });

            // Manage the visibility of the historical archive items
            updateHistoricalArchiveVisibility(); // Call the function to update visibility
        } else {
            console.error('Failed to retrieve audio entries: ' + data.message); // Log an error message if retrieval fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });









// ********DOM001**************Part 11 (Checked: "Was, in, working audio")




// Initialize channels setup on page load
setupPrePlaytimeChannels(); // Call the function to setup channels before playback starts
startScheduledPlayback(); // Call the function to start scheduled playback






// ********DOM001**************Part 12  (Checked: "Was, in, working audio")

}); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Where DOM Ends? it seems so.





// ********NotDOMed**************Part 1 (Checked: "Was, in, working audio")



function startRecording() {
    if (mediaStream) {
        // Create a new MediaRecorder instance with the media stream
        mediaRecorder = new MediaRecorder(mediaStream);
        // Start recording
        mediaRecorder.start();
        // Add event listener for when data is available
        mediaRecorder.addEventListener("dataavailable", (event) => {
            // Push the recorded data (audio chunk) to the audioChunks array
            audioChunks.push(event.data);
        });
    }
}









// ********NotDOMed**************Part 2 (Checked: "Was, in, working audio")



function playGifs() {
    if (isMouseDown) {
        // Get a random index for the GIF array
        gifIndex = Math.floor(Math.random() * gifs.length);
        // Select the record button image
        const img = document.querySelector("#recordButton");
        // Set the source of the image to the selected GIF
        img.src = gifs[gifIndex];
        // Add an event listener for when the image is loaded
        img.onload = () => {
            // Set a timeout to continue playing GIFs if the mouse is still down
            setTimeout(() => {
                if (isMouseDown) {
                    playGifs(); // Continue playing gifs if mouse is still down
                }
            }, img.naturalHeight * 10); // Adjust the multiplier if needed
        };
    }
}










// ********NotDOMed**************Part 3 (Checked: "Was, in, working audio")


async function handleRecordingStop() {
    // Create a Blob from the recorded audio chunks using WAV format
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    // Create a URL for the audio Blob
    const audioUrl = URL.createObjectURL(audioBlob);

    // Select the audio element and set its source to the audio URL
    const audioElement = document.getElementById("recordedAudio");
    audioElement.src = audioUrl;
    // Show the audio preview
    document.getElementById("audioPreview").style.display = "block";
    // Disable the upload MP3 button and change its background color to gray
    document.getElementById("uploadMp3Btn").disabled = true;
    document.getElementById("uploadMp3Btn").style.backgroundColor = "gray";
    // Clear the audio chunks array
    audioChunks = [];

    // Show the MP3 details section
    document.getElementById("mp3Details").style.display = "block";
    // Select the optional description field and show it
    const descriptionField = document.getElementById('OptionalDescriptionField');
    if (descriptionField) {
        descriptionField.style.display = 'block';
    }
    // Show the upload logo button
    document.getElementById("uploadLogoBtn").style.display = "inline";

    // Add an onclick event listener to the submit button
    document.getElementById("submitMp3").onclick = function() {
        console.log("Submitting recorded MP3");
        // Call the function to schedule the recorded MP3, passing the audio Blob
        scheduleRecordedMp3(audioBlob); // Pass the audioBlob
    };

    // Select the record button image and reset its source
    const img = document.querySelector("#recordButton");
    if (img) {
        img.src = '/includes/UnionRadioLogoVersion003ForUnionRadioWebsite.png';
    }
}








// ********NotDOMed**************Part 4 (Checked: "Was, in, working audio") (Note: This handles the form to send data to the server)

function scheduleRecordedMp3(audioBlob) {
    // Get the scheduled time for the MP3, or use the current time if not provided
    const mp3Time = document.getElementById('mp3Time').value || new Date().toISOString();
    // Get the title of the MP3
    const mp3Title = document.getElementById('mp3Title').value;
    // Get the description of the MP3, if provided
    const mp3Description = document.getElementById('OptionalDescriptionField')?.value;

    // Create a new FormData object to hold the data to be sent
    const formData = new FormData();
    // Append the recorded audio blob to the form data
    formData.append('recordedAudio', audioBlob, 'recording.wav'); // Use the audioBlob in WAV format
    // Append the scheduled time to the form data
    formData.append('mp3Time', mp3Time);
    // Append the title to the form data
    formData.append('mp3Title', mp3Title);
    // Append the description to the form data
    formData.append('mp3Description', mp3Description);

    // Get the logo file, if provided
    const logoFile = document.getElementById('logoInput').files[0];
    if (logoFile) {
        // Append the logo file to the form data
        formData.append('logoFile', logoFile);
    }

    // Send the form data to the server using fetch
    fetch('includes/uploadRecordedAudio.php', {
        method: 'POST', // Use the POST method
        body: formData // Set the request body to the form data
    })
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        if (data.status === "success") {
            // Get the play time as a timestamp
            const playTime = new Date(mp3Time).getTime();
            // Add the MP3 to the schedule
            addMp3ToSchedule(data.audio_id, data.audio_url, data.mp3Title, data.mp3Description, playTime, data.logo_url);

            // Clear the input fields
            document.getElementById('mp3Title').value = '';
            document.getElementById('logoInput').value = '';
            document.getElementById('OptionalDescriptionField').value = ''; 
            // Hide the MP3 details section
            document.getElementById('mp3Details').style.display = 'none';
            // Hide the upload logo button
            document.getElementById('uploadLogoBtn').style.display = 'none';
            // Hide the audio preview
            document.getElementById("audioPreview").style.display = "none"; 
            // Enable the upload MP3 button and reset its background color
            document.getElementById("uploadMp3Btn").disabled = false;
            document.getElementById("uploadMp3Btn").style.backgroundColor = "";

            // Clear the logo preview
            const existingImage = document.querySelector('#uploadLogoBtn + img');
            if (existingImage) {
                existingImage.remove(); // Remove the existing image
            }
        } else {
            console.error('01Upload failed: ' + data.message); // Log an error message if the upload fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });
}















// ********NotDOMed**************Part 5 (Checked: "Was, in, working audio") ***Update:> THERE WAS A PROBLEM AND SOLUTION, my code for some reason aint working perfectly ((with the: "02Upload failed") section) i need to learn how to access my php error logs to find out what the problem is). it aint playing the scheduled audios at their desired time. but, it is showing up on the calendar, with a playable 'play' button. that allows folks to play and see the thang. SO! we upgraded this code to 'refresh the page' (and have a toast saying its going to 'log the entry in <20sec' (via refreshing the page)); and that should be a temporary fix for now. -3:46pm on 1/24/25 ***Updated with sanitation & SQL Injection security(? did i do this?) as of 3:44pm on 2/5/25


// Sanitize function
function sanitize(input) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
}

// Add an event listener to the submit button for the MP3 form
document.getElementById('submitMp3').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission
    const form = document.getElementById('mp3Form'); // Get the MP3 form
    const formData = new FormData(form); // Create a new FormData object with the form data

    // Get the scheduled time for the MP3
    const mp3Time = document.getElementById('mp3Time').value;
    formData.append('mp3Time', mp3Time); // Append the scheduled time to the form data
    // Get the title of the MP3 and sanitize it
    const mp3Title = sanitize(document.getElementById('mp3Title').value);
    formData.append('mp3Title', mp3Title); // Append the sanitized title to the form data
    // Get the description of the MP3 and sanitize it
    const mp3Description = sanitize(document.getElementById('OptionalDescriptionField').value);
    formData.append('mp3Description', mp3Description); // Append the sanitized description to the form data
    // Get the logo file, if provided
    const logoFile = document.getElementById('logoInput').files[0];
    if (logoFile) {
        formData.append('logoFile', logoFile); // Append the logo file to the form data
    }

    // Get the MP3 file input and its file, if provided
    const mp3FileInput = document.getElementById('fileInput');
    const mp3File = mp3FileInput ? mp3FileInput.files[0] : null;
    if (mp3File) {
        formData.append('my_audio', mp3File); // Append the MP3 file to the form data
    } else {
        // If no MP3 file, get the recorded audio file from the audio element
        const recordedAudioFile = document.getElementById('recordedAudio').src.split(',')[1];
        if (recordedAudioFile) {
            formData.append('recordedAudio', recordedAudioFile, 'recording.wav'); // Append the recorded audio file to the form data
        }
    }

    // If the upload MP3 button is disabled, indicate that this is a recorded audio
    if (document.getElementById("uploadMp3Btn").disabled) {
        formData.append('audioRecorded', '1'); // Indicate that this is a recorded audio
    }

    // Send the form data to the server using fetch
    console.log('Sending form data to server...');
    fetch(form.action, {
        method: 'POST', // Use the POST method
        body: formData // Set the request body to the form data
    })
    .then(response => response.text()) // Get the raw response text
    .then(text => {
        console.log('Raw server response:', text); // Log the raw server response
        try {
            const data = JSON.parse(text); // Try to parse the response as JSON
            console.log('Parsed response data:', data);

            if (data.status === "success") {
                // Get the play time as a timestamp
                const playTime = new Date(mp3Time).getTime();
                // Add the MP3 to the schedule
                addMp3ToSchedule(data.audio_id, data.audio_url, data.mp3Title, data.mp3Description, playTime, data.logo_url);

                // Clear the input fields
                document.getElementById('mp3Title').value = '';
                document.getElementById('logoInput').value = '';
                document.getElementById('OptionalDescriptionField').value = ''; 
                // Hide the MP3 details section
                document.getElementById('mp3Details').style.display = 'none';
                // Hide the upload logo button
                document.getElementById('uploadLogoBtn').style.display = 'none';
                // Hide the audio preview
                document.getElementById("audioPreview").style.display = "none"; 
                // Enable the upload MP3 button and reset its background color
                document.getElementById("uploadMp3Btn").disabled = false;
                document.getElementById("uploadMp3Btn").style.backgroundColor = "";
            } else {
                console.error('02Upload failed:', data.message); // Hey my love, i think i figured out why im getting this. ***A.) this error shows up because when i look through the logs. i see that both: "submitMp3.php" (also known as: "// ********NotDOMed**************Part 5" ) AAAAAAAAANNNNNNNDDDDDDD "uploadRecordedAudio.php" (also known as: // ********NotDOMed**************Part 4" (so one PRECEDING this) WHICH, (the one preceding this: uploadRecordedAudio.php" (also known as: // ********NotDOMed**************Part 4" SEEEEEEEEMS TO BEEEEEE, CLEARING THE INPUT FIELDS!!!!!!!!!!!!!! AND THIS "02Upload failed:" I THIIIIIIIIIIIIIIIIIIIIIIIIIIIIIINK~ IS TO REPRESENTTTTTTTTTTTTTTTTTTTTTT, that "it coulnt clear/delete any input fields. there was no success.' BECAUSEEEE IT WAS ALREADY COVERED (I THINK!!!!! BY:>) uploadRecordedAudio.php" (also known as: // ********NotDOMed**************Part 4))) I THINK!
            }
        } catch (error) {
            console.error('Error parsing JSON:', error); // Log any JSON parsing errors
        }
    })
    .catch(error => {
        console.error('Error during fetch:', error); // Log an error message if there's an error during fetch
    });
});












// ********NotDOMed**************Part 6 (Checked: "Was, in, working audio")


function addMp3ToSchedule(audioId, audioUrl, mp3Title, mp3Description, playTime, logoUrl) {
    console.log("Adding MP3 to schedule:", mp3Title); // Log the title of the MP3 being added
    const scheduleContainer = document.getElementById("scheduleContainer"); // Get the schedule container element
    const eventDate = new Date(playTime).toDateString(); // Convert the play time to a date string
    // Find a date slot in the schedule container that matches the event date
    let dateSlot = Array.from(scheduleContainer.children).find(child => child.dataset.date === eventDate);
    if (!dateSlot) { // If no matching date slot is found
        dateSlot = document.createElement('div'); // Create a new div element for the date slot
        dateSlot.dataset.date = eventDate; // Set the data-date attribute to the event date
        // Add a class based on whether the play time is in the past or future
        dateSlot.classList.add(playTime <= Date.now() ? "past-day" : "future-day");
        dateSlot.textContent = eventDate; // Set the text content to the event date
        scheduleContainer.appendChild(dateSlot); // Append the date slot to the schedule container
    }

    const newEvent = document.createElement('div'); // Create a new div element for the event
    newEvent.style.color = "white"; // Set the text color to white
    newEvent.innerHTML = `
        <div>${new Date(playTime).toLocaleTimeString()} 
        <span style="font-weight:bold; background: linear-gradient(10deg, #f7ec9c, #ff8651);-webkit-background-clip: text; color: transparent;">${mp3Title ? `${mp3Title}` : ""}</span>
        ${mp3Description ? `${mp3Description}` : ""}
        ${logoUrl ? `<p><img src="../uploads/${logoUrl}" alt="Logo" style="max-width: 100px; max-height: 100px; object-fit: contain; vertical-align: middle;"></p>` : ""}
    </div>
    `;
    dateSlot.appendChild(newEvent); // Append the new event to the date slot

    const audioElement = document.createElement('audio'); // Create a new audio element
    audioElement.src = `../uploads/${audioUrl}`; // Set the source of the audio element to the audio URL
    audioElement.controls = true; // Enable audio controls

    // Add the MP3 details to the schedule array
    mp3Schedule.push({ 
        id: audioId,
        time: playTime, 
        title: mp3Title, 
        description: mp3Description,
        audioUrl: `../uploads/${audioUrl}`,
        logoUrl: `../uploads/${logoUrl}`, // Ensure logo URL is stored
        audio: audioElement 
    });

    // Sort the MP3 schedule by play time
    mp3Schedule.sort((a, b) => a.time - b.time);

    updateNextMp3(); // Update the next MP3 to be played

    const delay = playTime - Date.now(); // Calculate the delay until the play time

    // Check for multiple scheduled audios at the same time
    if (delay > 0) {
        // Create channels 5 seconds before the scheduled play time
        setTimeout(() => {
            setupChannels(mp3Schedule.filter(mp3 => mp3.time === playTime));
        }, delay - 5 * 1000);
    } else {
        playNextInQueue(0); // Play the next MP3 in the queue immediately if the delay is not positive
    }
}

















// ********NotDOMed**************Part 7 (Checked: "Was, in, working audio")



function updateNextMp3() {
    console.log("Updating next MP3 display"); // Log the action for debugging
    const now = new Date().getTime(); // Get the current time
    const upcomingMp3s = mp3Schedule.filter(mp3 => mp3.time > now); // Filter the MP3s that are scheduled to play in the future
    const nextMp3Container = document.getElementById('headerRightContainer004'); // Get the container element for displaying the next MP3

    nextMp3Container.innerHTML = ''; // Clear previous content

    if (upcomingMp3s.length > 0) { // Check if there are any upcoming MP3s
        const nextMp3 = upcomingMp3s[0]; // Get the next MP3 to be played
        nextMp3Container.innerHTML = `
            <p>${new Date(nextMp3.time).toLocaleString()} - ${nextMp3.title}</p>
        `; // Display the time and title of the next MP3
        if (upcomingMp3s.length > 1) { // Check if there is a second upcoming MP3
            const secondNextMp3 = upcomingMp3s[1]; // Get the second next MP3
            nextMp3Container.innerHTML += `
                <p>${new Date(secondNextMp3.time).toLocaleString()} - ${secondNextMp3.title}</p>
            `; // Display the time and title of the second next MP3
        }
        if (upcomingMp3s.length > 2) { // Check if there is a third upcoming MP3
            const thirdNextMp3 = upcomingMp3s[2]; // Get the third next MP3
            nextMp3Container.innerHTML += `
                <p>${new Date(thirdNextMp3.time).toLocaleString()} - ${thirdNextMp3.title}</p>
            `; // Display the time and title of the third next MP3
        }
    } else {
        // >>>>>>>>>>>>(this, IS, in audio that works but not here? -10:59pm on 1/16/25:>)>>>>>>>>>>>>reimplement if you so wish>>>>>>>>>>>>>>>>>>>>>>>>>>> nextMp3Container.innerHTML = '<p>No upcoming tracks</p>';  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< But, just so you know, it was comented out because of: //<<<<<<<<<<<<<< I commented this out as of 12/16/24 because (if you CTRL+F "No upcoming tracks" you'll notice its already covered elsewhere (around the: "function updateComingUpNext()")
    }

    const nextMp3Index = mp3Schedule.findIndex(mp3 => mp3.time > now); // Find the index of the next MP3 to be played
    if (nextMp3Index !== -1) { // If a next MP3 is found
        setTimeout(() => {
            playNextInQueue(nextMp3Index); // Schedule the next MP3 to play
        }, mp3Schedule[nextMp3Index].time - now); // Calculate the delay until the next MP3 should play
    }
}

















// ********NotDOMed**************Part 8 (Checked: "Was, in, working audio")

function playNextInQueue(index) {
    if (index < mp3Schedule.length) { // Check if the index is within the range of the schedule
        const nextMp3 = mp3Schedule[index]; // Get the next MP3 to be played
        const now = new Date().getTime(); // Get the current time
        if (nextMp3.time <= now) { // Check if it is time to play the next MP3
            playMp3(nextMp3.id, nextMp3.title, nextMp3.audioUrl, nextMp3.description, nextMp3.logoUrl, index + 1); // Play the next MP3
        } else {
            const delay = nextMp3.time - now; // Calculate the delay until the next MP3 should play
            setTimeout(() => {
                playNextInQueue(index); // Schedule the next MP3 to play
            }, delay); // Set the timeout for the calculated delay
        }
    }
}
















// ********NotDOMed**************Part 9 (Checked: "Was, in, working audio")




function playMp3(audioId, mp3Title, audioUrl, mp3Description, logoUrl, nextIndex) {
    console.log("Playing MP3:", mp3Title, "URL:", audioUrl); // Log the MP3 title and URL being played
    const nowPlayingContainer = document.getElementById('headerRightContainer002'); // Get the container element for now playing
    nowPlayingContainer.innerHTML = `
        <p>${mp3Title}</p> <!-- Display the MP3 title -->
        ${mp3Description ? `<p>${mp3Description}</p>` : ""} <!-- Display the MP3 description if available -->
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">` : ""} <!-- Display the logo if available -->
    `;

    const audioElement = new Audio(audioUrl); // Create a new audio element with the audio URL
    audioElement.controls = true; // Enable audio controls
    nowPlayingContainer.appendChild(audioElement); // Append the audio element to the now playing container

    const playStartTime = new Date(); // Record the start time of the audio

    audioElement.play(); // Play the audio

    // Check if the audio is not playing after 10 seconds and skip if needed
    const checkPlayState = setTimeout(() => {
        if (audioElement.currentTime === 0 && !audioElement.paused) { // Check if the audio has not started playing
            console.warn("Audio failed to start, skipping to the next"); // Log a warning message
            updateSkippedAudio(audioId); // Mark the audio as skipped
            playNextInQueue(nextIndex); // Play the next MP3 in the queue
        }
    }, 10000); // 10 seconds

    audioElement.onended = function() {
        clearTimeout(checkPlayState); // Clear the timeout if the audio plays correctly
        console.log("MP3 ended:", mp3Title); // Log that the MP3 has ended
        const playEndTime = new Date(); // Record the end time of the audio
        const length = Math.round((playEndTime - playStartTime) / 1000); // Calculate length in seconds

        // Send the audio times to the server to update
        fetch('includes/updateAudioTimes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
            },
            body: `audio_id=${audioId}&start_time=${playStartTime.toISOString()}&end_time=${playEndTime.toISOString()}&length=${length}` // Set the request body
        })
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            if (data.status === 'success') {
                console.log("Audio times updated successfully"); // Log success message
                addMp3ToArchive(audioId, mp3Title, mp3Description, logoUrl, audioUrl); // Add to archive
            } else {
                console.error("Failed to update audio times: " + data.message); // Log an error message if the update fails
            }
        })
        .catch(error => {
            console.error('Error:', error); // Log an error message if there's an error during fetch
        });

        // Add to recently played
        addRecentlyPlayed(audioId, mp3Title, mp3Description, logoUrl, audioUrl);

        // Continue playing the next MP3 in queue
        playNextInQueue(nextIndex);
    };
}















// ********NotDOMed**************Part 10 (Checked: "Was, in, working audio")


function updateSkippedAudio(audioId) {
    // Send a POST request to update the skipped audio status
    fetch('includes/updateSkippedAudio.php', {
        method: 'POST', // Use the POST method
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
        },
        body: `audio_id=${audioId}&skipped=1` // Set the request body with audio ID and skipped status
    })
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        if (data.status === 'success') {
            console.log("Audio marked as skipped successfully"); // Log success message
        } else {
            console.error("Failed to mark audio as skipped: " + data.message); // Log an error message if the update fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });
}























// ********NotDOMed**************Part 11 (Checked: "Was, in, working audio")


function setupChannels(audioEntries) {
    const channelsContainer = document.getElementById('Channels'); // Get the container element for channels
    if (audioEntries.length > 1) { // Check if there are multiple audio entries
        channelsContainer.innerHTML = `
            <h2 style="color: black;">
                Ch: <span id="currentChannelNumber">1</span>
                <button id="prevChannel" style="display:inline;">⬅️</button>
                <button id="nextChannel">➡️</button>
            </h2>
        `; // Create the channel display with navigation buttons

        document.getElementById('nextChannel').addEventListener('click', () => {
            currentChannel = currentChannel === audioEntries.length ? 1 : currentChannel + 1; // Update to the next channel
            updateChannelDisplay(); // Update the channel display
        });

        document.getElementById('prevChannel').addEventListener('click', () => {
            currentChannel = currentChannel === 1 ? audioEntries.length : currentChannel - 1; // Update to the previous channel
            updateChannelDisplay(); // Update the channel display
        });

        // Initial display update
        updateChannelDisplay(); // Call the function to update the display initially
    } else {
        channelsContainer.innerHTML = ''; // Clear the container if there is only one audio entry
    }
}



















// ********NotDOMed**************Part 12 (Checked: "Was, in, working audio")


function updateChannelDisplay() {
    const channelsContainer = document.getElementById('Channels'); // Get the container element for channels
    // Loop through the children of the container and display the current channel
    Array.from(channelsContainer.children).forEach((child, index) => {
        child.style.display = (index + 1 === currentChannel) ? 'block' : 'none'; // Display only the current channel
    });

    const prevChannelButton = document.getElementById('prevChannel'); // Get the previous channel button
    const nextChannelButton = document.getElementById('nextChannel'); // Get the next channel button
    prevChannelButton.style.display = 'inline'; // Ensure the previous channel button is displayed
    nextChannelButton.style.display = 'inline'; // Ensure the next channel button is displayed
}


















// ********NotDOMed**************Part 13 (Checked: "Was, in, working audio")



function addRecentlyPlayed(audioId, mp3Title, mp3Description, logoUrl, audioUrl) {
    const recentlyPlayedContainer = document.getElementById('headerRightContainer006'); // Get the container element for recently played MP3s

    // Add the most recently played MP3 to the beginning of the list
    recentlyPlayed.unshift({
        id: audioId,
        title: mp3Title,
        description: mp3Description,
        logoUrl: logoUrl,
        audioUrl: audioUrl
    });

    // Keep only the 3 most recent entries
    if (recentlyPlayed.length > 3) {
        recentlyPlayed.pop(); // Remove the oldest entry if there are more than 3
    }

    // Clear the container and add the recently played MP3s
    recentlyPlayedContainer.innerHTML = recentlyPlayed.map(mp3 => `
        <div>
            <button class="upvote" onclick="voteUp(${mp3.id}, this)">⬆️</button> <!-- Upvote button -->
            <button class="downvote" onclick="voteDown(${mp3.id}, this)">⬇️</button> <!-- Downvote button -->
            <p>${mp3.title}</p> <!-- Display the MP3 title -->
            ${mp3.description ? `<p>${mp3.description}</p>` : ""} <!-- Display the MP3 description if available -->
            ${mp3.logoUrl ? `<img src="${mp3.logoUrl}" alt="Logo" style="max-width: 50px; max-height: 50px; object-fit: contain;">` : ""} <!-- Display the logo if available -->
        </div>
    `).join(''); // Join the HTML strings and set it as the innerHTML of the container
}



















// ********NotDOMed**************Part 14 (Checked: "Was, in, working audio")



// Function to handle upvoting for MP3s
function voteUp(audioId, button) {
    fetch('includes/voteUp.php', {
        method: 'POST', // Use the POST method
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
        },
        body: `audio_id=${audioId}` // Set the request body with the audio ID
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json(); // Parse the response as JSON if the content type is JSON
        } else {
            return response.text().then(text => { throw new Error(text); }); // Otherwise, parse as text and throw an error
        }
    })
    .then(data => {
        if (data.status === 'success') {
            console.log("Upvote recorded successfully"); // Log success message
            button.classList.add('clicked'); // Add the 'clicked' class to the button
            button.nextSibling.classList.remove('clicked'); // Remove the 'clicked' state from the downvote button
        } else {
            console.error("Failed to record upvote: " + data.message); // Log an error message if the upvote fails
        }
    })
    .catch(error => {
        console.error('Error:', error.message); // Log an error message if there's an error during fetch
    });
}
















// ********NotDOMed**************Part 15 (Checked: "Was, in, working audio")



// Function to handle downvoting for MP3s
function voteDown(audioId, button) {
    fetch('includes/voteDown.php', {
        method: 'POST', // Use the POST method
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
        },
        body: `audio_id=${audioId}` // Set the request body with the audio ID
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json(); // Parse the response as JSON if the content type is JSON
        } else {
            return response.text().then(text => { throw new Error(text); }); // Otherwise, parse as text and throw an error
        }
    })
    .then(data => {
        if (data.status === 'success') {
            console.log("Downvote recorded successfully"); // Log success message
            button.classList.add('clicked'); // Add the 'clicked' class to the button
            button.previousSibling.classList.remove('clicked'); // Remove the 'clicked' state from the upvote button
        } else {
            console.error("Failed to record downvote: " + data.message); // Log an error message if the downvote fails
        }
    })
    .catch(error => {
        console.error('Error:', error.message); // Log an error message if there's an error during fetch
    });
}







// ********NotDOMed**************Part 16 (Checked: "Was, in, working audio")



// Add an event listener to the upload logo button
document.getElementById('uploadLogoBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent any default action
    console.log("Upload logo button clicked"); // Log the action for debugging
    document.getElementById('logoInput').click(); // Trigger the logo input click
});

















// ********NotDOMed**************Part 17 (Checked: "Was, in, working audio")





// Add an event listener to the logo input change
document.getElementById('logoInput').addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    console.log("Logo file selected:", file.name); // Log the file name for debugging
    if (file) {
        const reader = new FileReader(); // Create a new FileReader instance
        reader.onload = function(e) {
            // Clear any previous image previews
            const existingImage = document.querySelector('#uploadLogoBtn + img');
            if (existingImage) {
                existingImage.remove(); // Remove the existing image
            }
            const img = document.createElement('img'); // Create a new image element
            img.src = e.target.result; // Set the source of the image to the file data
            img.style.maxWidth = '150px'; // Set the maximum width of the image
            img.style.maxHeight = '150px'; // Set the maximum height of the image
            img.style.objectFit = 'contain'; // Set the object-fit property to contain
            document.getElementById('uploadLogoBtn').insertAdjacentElement('afterend', img); // Insert the image after the upload logo button
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});









// ********NotDOMed**************Part 18 (Checked: "Was, in, working audio")





// Function to manage Archive Visibility (showing only 10 archive entries at a time)
function manageArchiveVisibility() {
    console.log("Managing archive visibility"); // Log the action for debugging
    const archiveItems = document.querySelectorAll('#bottomArchiveContainer > div'); // Get all archive items
    const showButtonId = 'showMoreButton'; // Set the ID for the "Show More" button

    archiveItems.forEach((item, index) => {
        if (index < visibleCount) { // Show items within the visible count
            item.style.display = 'block';
        } else { // Hide items beyond the visible count
            item.style.display = 'none';
        }
    });

    const showMoreButton = document.getElementById(showButtonId); // Get the "Show More" button
    if (showMoreButton) {
        showMoreButton.remove(); // Remove the button if it exists
    }

    if (archiveItems.length > visibleCount) { // Check if there are more items to show
        const showMoreButton = document.createElement('button'); // Create the "Show More" button
        showMoreButton.id = showButtonId;
        showMoreButton.innerText = 'Show Next 10?';
        showMoreButton.className = 'button-style'; // Apply the same button styling
        showMoreButton.onclick = () => {
            visibleCount += 10; // Increase the visible count by 10
            manageArchiveVisibility(); // Update the visibility of archive items
        };
        document.getElementById('bottomArchiveContainer').appendChild(showMoreButton); // Append the "Show More" button to the container
    }
}







// ********NotDOMed**************Part 19 (Checked: "Was, in, working audio")




// Initialize archive visibility management on page load
manageArchiveVisibility(); // Call the function to manage archive visibility initially











// ********NotDOMed**************Part 20 (Checked: "Was, in, working audio") (NEVER TESTED ITS RE-IMPLEMENTATION! -11:10pm on 1/16/25)




// Function to generate schedule grid
//i believe this is a repeat                        function generateSchedule() {
//i believe this is a repeat                            const container = document.getElementById('scheduleContainer');
//i believe this is a repeat                            const currentDate = new Date();
//i believe this is a repeat                            currentDate.setDate(currentDate.getDate() - 14);
//i believe this is a repeat
//i believe this is a repeat                            for (let i = 0; i < 31; i++) {
//i believe this is a repeat                                const day = document.createElement('div');
//i believe this is a repeat                                if (i === 14) {
//i believe this is a repeat                                    day.classList.add('current-day');
//i believe this is a repeat                                } else if (i < 14) {
//i believe this is a repeat                                    day.classList.add('past-day');
//i believe this is a repeat                                } else {
//i believe this is a repeat                                    day.classList.add('future-day');
//i believe this is a repeat                                }
//i believe this is a repeat                                day.dataset.date = currentDate.toDateString();
//i believe this is a repeat                                day.textContent = currentDate.toDateString();
//i believe this is a repeat                                container.appendChild(day);
//i believe this is a repeat                                currentDate.setDate(currentDate.getDate() + 1);
//i believe this is a repeat                            }
//i believe this is a repeat                        }








// ********Triggered AFTER DOM Loaded************** Part 0  (Checked: "Was, in, working audio")



// Initialize the script after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {






    
// ********Triggered AFTER DOM Loaded************** Part 1 (Checked: "Was, in, working audio")


    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        // Request access to the user's microphone and store the stream
        mediaStream = stream;
    }).catch((error) => {
        console.error("Error accessing microphone:", error); // Log an error message if there's an error accessing the microphone
    });








    
// ********Triggered AFTER DOM Loaded************** Part 2 (Checked: "Was, in, working audio")

    // Handle recording with image
    const img = document.querySelector("#recordButton"); // Select the record button image
    if (img) {
        img.addEventListener("mousedown", () => {
            // Add an event listener for the mousedown event on the record button
            isMouseDown = true; // Set isMouseDown to true
            startRecording(); // Start recording audio
            playGifs(); // Play GIFs for recording animation
        });

        img.addEventListener("mouseup", () => {
            // Add an event listener for the mouseup event on the record button
            isMouseDown = false; // Set isMouseDown to false
            if (mediaRecorder) {
                mediaRecorder.stop(); // Stop the media recorder
                mediaRecorder.addEventListener("stop", handleRecordingStop); // Handle the stop event of the recorder
            }
        });

        img.addEventListener("mouseleave", () => {
            // Add an event listener for the mouseleave event on the record button
            if (isMouseDown) {
                isMouseDown = false; // Set isMouseDown to false
                if (mediaRecorder && mediaRecorder.state === "recording") {
                    mediaRecorder.stop(); // Stop the media recorder if it's recording
                }
            }
        });
    } else {
        console.error("Element with ID 'recordButton' not found."); // Log an error message if the record button is not found
    }








// ********Triggered AFTER DOM Loaded************** Part 3 (Checked: "Was, in, working audio")




    // Handle removing audio preview
    const removeAudioBtn = document.getElementById("removeAudioBtn"); // Select the remove audio button
    if (removeAudioBtn) {
        removeAudioBtn.addEventListener("click", () => {
            // Add an event listener for the click event on the remove audio button
            document.getElementById("audioPreview").style.display = "none"; // Hide the audio preview
            document.getElementById("uploadMp3Btn").disabled = false; // Enable the upload MP3 button
            document.getElementById("uploadMp3Btn").style.backgroundColor = ""; // Reset the background color of the upload MP3 button
            document.getElementById("recordedAudio").src = ""; // Clear the audio source
            document.getElementById("mp3Details").style.display = "none"; // Hide the MP3 details section
        });
    } else {
        console.error("Element with ID 'removeAudioBtn' not found."); // Log an error message if the remove audio button is not found
    }




    // ********Triggered AFTER DOM Loaded************** Part 4 (Checked: "Was, in, working audio")

    //i believe this is a repeat:>>>>>>>>> and only this line here:>>>>>>>>>>>>            generateSchedule(); // Ensure the schedule is generated on page load




// ********Triggered AFTER DOM Loaded************** Part 5  (Checked: "Was, in, working audio" BUT:>>>>>>>>>>>>>> **********************THIS IS VERY DIFFERENT THAN MY AUDIO ONE, FOR EXAMPLE, I HAVE A FK TON OF LETS, THAT DOES, SEEM TO GIVE ME THE EASIEST SIGNAL OF MY WIRES BEING CROSSED HERE; ALSO; I HAVE ANOTHER PART CALLED XXX PART UNO OF 3, THAT USED TO BE ON, ALONG WITH THIS ONE('s older version) SO MAYBE BOTH OF THAT ONE AND THESE ONES ON ARE SUPPOSED TO BE THERE TOGETHER!? idk, maybe the first one fetches the data, and this one shows it? no clue if im reading that right; or i could be 100% wrong yo. ANYWHO! LETS CALL THIS QUEST ZZZ Part 1 of Z -11:17pm on 1/16/25)

//Note to self:> Hey my love, this stuff below is most likely really important. but right now, im looking for code thats creating duplicates. and this seems to be one of them. im looking for 2. lets call this XXX Part 2 of 3
//Extra Note, related to this ^^^^ well thats interesting. if you CTRL+F This line here ^^^ you'll see the same commented out thang twice. (the individual line above it. and the code below it. thats interesting. might be really important to figure it out my love but hey, this is interesting. XXX part 3 of 3)
//Extra Extra Note:> This stuff was commented out, cause, after i 'schedule a video' and it plays. and its in the calendar. and after it plays it goes bye bye. in the calendar, if it 'used to show (optional:) title,description, logo, ALONG WITH scheduled times? THIS CODE, only had it show scheduled time. which i suppose makes sense, cause, this php file is not equipped for that yo. and it sees to be a repeat. so to integrate it, i'd have to like, upgrade this type of php file or a whole other php file that brings these entries back after theyve played. you know? =D! 

// ***********************Fetch and display the scheduled MP3s from the database >>>>> HAS BEEN COMMENTED OUT AS OF 10:02pm on 1/19/25 DUE TO HOW CLOSE IT WAS TO WHAT PART 6 WAS DOING; SO I JUST MERGED ANY STUFF FROM PART 5 TO PART 6 AND COMMENTED OUT PART 5
 fetch('includes/getScheduledMp3s.php')
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        console.log('Fetched MP3s Data:', data); // Log the entire response

        if (data.status === "success" && data.mp3s) { // Check if the status is "success" and there are MP3s
            data.mp3s.forEach(mp3 => { // Loop through each MP3
                console.log('Processing MP3:', mp3); // Log each MP3 entry

                const playTime = new Date(mp3.audio_scheduled_time_to_play).getTime(); // Convert the scheduled play time to a timestamp

                let id = mp3.id;
                let url = mp3.audio_url ? mp3.audio_url : mp3.video_url; // Use audio URL if available, otherwise use video URL
                let title = mp3.audio_title_user_uploaded ? mp3.audio_title_user_uploaded : mp3.video_title; // Use audio title if available, otherwise use video title
                let description = mp3.audio_description ? mp3.audio_description : mp3.video_description; // Use audio description if available, otherwise use video description
                let logoUrl = mp3.audio_logo_url ? mp3.audio_logo_url : mp3.video_logo_url; // Use audio logo URL if available, otherwise use video logo URL
                let audioUrl = mp3.audio_url;
                let videoUrl = mp3.video_url;

                // Directly use the video details if audio details are not found
                if (title || description || logoUrl) {
                    addMp3ToSchedule(id, url, title, description, playTime, logoUrl, audioUrl, videoUrl);
                } else {
                    // Retry logic to ensure details are correctly assigned
                    let attempts = 0;
                    const intervalId = setInterval(() => {
                        attempts++;
                        console.log(`Attempt ${attempts}: Updating schedule for ID: ${id}`);
                        addMp3ToSchedule(id, url, title, description, playTime, logoUrl, audioUrl, videoUrl);

                        // Check if the update was successful
                        const eventElement = document.querySelector(`#event-${id}`);
                        if (eventElement && eventElement.innerHTML.includes(title)) {
                            clearInterval(intervalId); // Clear the interval if the update was successful
                            console.log('Successfully updated schedule for ID:', id);
                        }

                        if (attempts >= 10) {
                            clearInterval(intervalId); // Stop trying after 10 attempts
                            console.error('Failed to update schedule after 10 attempts for ID:', id);
                        }
                    }, 4000); // Retry every 4 seconds
                }
            });
            updateNextMp3(); // Ensure the next MP3 is scheduled to play

            // Setup channels for MP3s scheduled at the same time
            const groupedByTime = {};
            data.mp3s.forEach(mp3 => {
                const time = new Date(mp3.audio_scheduled_time_to_play).getTime(); // Convert the scheduled play time to a timestamp
                if (!groupedByTime[time]) {
                    groupedByTime[time] = []; // Initialize an array if it doesn't exist for this time
                }
                groupedByTime[time].push(mp3); // Add the MP3 to the array for this time
            });

            Object.keys(groupedByTime).forEach(time => {
                setupChannels(groupedByTime[time]); // Setup channels for MP3s scheduled at the same time
            });
        } else {
            console.error('Failed to retrieve scheduled MP3s: ' + data.message); // Log an error message if retrieval fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });









    // ********Triggered AFTER DOM Loaded************** Part 6 NOT IN WORKING AUDIOS, I CHECKED -11:38pm on 1/16/25 ***Update:> PART 5 and PART 6 seemed very similar, so i combined them as of (and commented out part 5) -10:00pm on 1/19/25 ***Update:> Note:> this code block is more for: 'handles fetching and scheduling MP3s from a database'. -10:09pm on 1/19/25

// Fetch and display the scheduled MP3s from the database
fetch('includes/getScheduledMp3s.php')
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        console.log('Fetched MP3s Data:', data); // Log the entire response

        if (data.status === "success" && data.mp3s) { // Check if the status is "success" and there are MP3s
            const dateEntries = {}; // Object to store entries by date

            data.mp3s.forEach(mp3 => { // Loop through each MP3
                console.log('Processing MP3:', mp3); // Log each MP3 entry

                // Periodically check and reorder entries
let reorderAttempts = 0;
const reorderIntervalId = setInterval(() => {
    // Increment reorder attempts
    reorderAttempts++;
    console.log(`Reorder Attempt ${reorderAttempts}: Checking and reordering calendar entries`);

    const scheduleContainer = document.getElementById('scheduleContainer'); // Get the schedule container element
    const dateSlots = Array.from(scheduleContainer.children); // Get all date slots as an array
    dateSlots.forEach(dateSlot => {
        const eventDate = dateSlot.dataset.date; // Get the date associated with the slot
        if (dateEntries[eventDate]) { // Check if there are entries for this date
            const entries = dateEntries[eventDate]; // Get the entries for this date

            // Sort entries by playTime in descending order
            entries.sort((a, b) => b.playTime - a.playTime);

            // Clone the date header
            const dateHeader = dateSlot.firstChild.cloneNode(true);

            // Remove all child nodes
            while (dateSlot.firstChild) {
                dateSlot.removeChild(dateSlot.firstChild);
            }

            // Reappend the cloned date header
            dateSlot.appendChild(dateHeader);

            // Reappend sorted entries
            entries.forEach(entry => {
                let existingEvent = document.createElement('p'); // Create a new paragraph element for the event
                existingEvent.id = `event-${entry.id}`; // Set the event ID
                existingEvent.style.color = "white"; // Set the text color to white
                existingEvent.innerHTML = `
                    <div>${new Date(entry.playTime).toLocaleTimeString()} 
                    <span style="cursor: pointer;" onclick="playMedia('${entry.audioUrl}', '${entry.videoUrl}')">►</span> <span style="font-weight:bold; background: linear-gradient(10deg, #f7ec9c, #ff8651);-webkit-background-clip: text; color: transparent;">${entry.title ? `${entry.title}` : ""}</span>
                    ${entry.description ? `${entry.description}` : ""}
                    ${entry.logoUrl ? `<p id="logo-${entry.id}"><img src="../uploads/${entry.logoUrl}" alt="Loading..." style="max-width: 100px; max-height: 100px; object-fit: contain; vertical-align: middle;"></p>` : ""}
                    
                        
                        ID: ${entry.id}
                    
                </div>
                `;
                dateSlot.appendChild(existingEvent); // Append the event to the date slot

                // Add loading GIF if the logo file exists and image hasn't been loaded
                if (entry.logoUrl && !loadedImages[entry.id]) {
                    const logoContainer = document.getElementById(`logo-${entry.id}`);
                    logoContainer.innerHTML = '<img src="/includes/UminionRadioGIFversion06.gif" alt="Loading..." style="width: 100px; height: 100px;">';
                    checkAndUpdateLogo(entry.id, entry.logoUrl, 0); // Check and update the logo
                }
            });
        }
    });

    if (reorderAttempts >= 10) {
        clearInterval(reorderIntervalId); // Stop after 10 attempts
        console.log('Stopped reordering after 10 attempts');
    }
}, 6000); // Check and reorder every 6 seconds


                const playTime = new Date(mp3.audio_scheduled_time_to_play).getTime(); // Convert the scheduled play time to a timestamp

                let id = mp3.id;
                let url = mp3.audio_url ? mp3.audio_url : mp3.video_url; // Use audio URL if available, otherwise use video URL
                let title = mp3.audio_title_user_uploaded ? mp3.audio_title_user_uploaded : mp3.video_title; // Use audio title if available, otherwise use video title
                let description = mp3.audio_description ? mp3.audio_description : mp3.video_description; // Use audio description if available, otherwise use video description
                let logoUrl = mp3.audio_logo_url ? mp3.audio_logo_url : mp3.video_logo_url; // Use audio logo URL if available, otherwise use video logo URL
                let audioUrl = mp3.audio_url;
                let videoUrl = mp3.video_url;

                // Directly use the video details if audio details are not found
                if (title || description || logoUrl) {
                    addMp3ToSchedule(id, url, title, description, playTime, logoUrl, audioUrl, videoUrl); // Add MP3 to the schedule
                } else {
                    // Retry logic to ensure details are correctly assigned
                    let attempts = 0;
                    const intervalId = setInterval(() => {
                        attempts++;
                        console.log(`Attempt ${attempts}: Updating schedule for ID: ${id}`);
                        addMp3ToSchedule(id, url, title, description, playTime, logoUrl, audioUrl, videoUrl); // Retry adding MP3 to the schedule

                        // Check if the update was successful
                        const eventElement = document.querySelector(`#event-${id}`);
                        if (eventElement && eventElement.innerHTML.includes(title)) {
                            clearInterval(intervalId); // Clear the interval if the update was successful
                            console.log('Successfully updated schedule for ID:', id);
                        }

                        if (attempts >= 10) {
                            clearInterval(intervalId); // Stop trying after 10 attempts
                            console.error('Failed to update schedule after 10 attempts for ID:', id);
                        }
                    }, 4000); // Retry every 4 seconds
                }


                // Add entry to dateEntries object
                const eventDate = new Date(playTime).toDateString(); // Convert play time to a date string
                if (!dateEntries[eventDate]) {
                    dateEntries[eventDate] = []; // Initialize an array if it doesn't exist for this date
                }
                dateEntries[eventDate].push({ id, url, title, description, playTime, logoUrl, audioUrl, videoUrl }); // Add the MP3 entry to the dateEntries object
            });
            // Periodically check and reorder entries
            let reorderAttempts = 0;
            const reorderIntervalId = setInterval(() => {
                // Increment reorder attempts
                reorderAttempts++;
                console.log(`Reorder Attempt ${reorderAttempts}: Checking and reordering calendar entries`);

                const scheduleContainer = document.getElementById('scheduleContainer'); // Get the schedule container element
                const dateSlots = Array.from(scheduleContainer.children); // Get all date slots as an array
                dateSlots.forEach(dateSlot => {
                    const eventDate = dateSlot.dataset.date; // Get the date associated with the slot
                    if (dateEntries[eventDate]) { // Check if there are entries for this date
                        const entries = dateEntries[eventDate]; // Get the entries for this date

                        // Sort entries by playTime in descending order
                        entries.sort((a, b) => b.playTime - a.playTime);

                        // Clone the date header
                        const dateHeader = dateSlot.firstChild.cloneNode(true);

                        // Remove all child nodes
                        while (dateSlot.firstChild) {
                            dateSlot.removeChild(dateSlot.firstChild);
                        }

                        // Reappend the cloned date header
                        dateSlot.appendChild(dateHeader);

                        // Reappend sorted entries
                        entries.forEach(entry => {
                            let existingEvent = document.createElement('p'); // Create a new paragraph element for the event
                            existingEvent.id = `event-${entry.id}`; // Set the event ID
                            existingEvent.style.color = "white"; // Set the text color to white
                            existingEvent.innerHTML = `
                                <div>${new Date(entry.playTime).toLocaleTimeString()} 
                                <span style="cursor: pointer;" onclick="playMedia('${entry.audioUrl}', '${entry.videoUrl}')">►</span> <span style="font-weight:bold; background: linear-gradient(10deg, #f7ec9c, #ff8651);-webkit-background-clip: text; color: transparent;">${entry.title ? `${entry.title}` : ""}</span>
                                ${entry.description ? `${entry.description}` : ""}
                                ${entry.logoUrl ? `<p id="logo-${entry.id}"><img src="../uploads/${entry.logoUrl}" alt="Loading..." style="max-width: 100px; max-height: 100px; object-fit: contain; vertical-align: middle;"></p>` : ""}
                                
                                    
                                    ID: ${entry.id}
                                
                            </div>
                            `;
                            dateSlot.appendChild(existingEvent); // Append the event to the date slot

                            // Add loading GIF if the logo file exists and image hasn't been loaded
                            if (entry.logoUrl && !loadedImages[entry.id]) {
                                const logoContainer = document.getElementById(`logo-${entry.id}`);
                                logoContainer.innerHTML = '<img src="/includes/UminionRadioGIFversion06.gif" alt="Loading..." style="width: 100px; height: 100px;">';
                                checkAndUpdateLogo(entry.id, entry.logoUrl, 0); // Check and update the logo
                            }
                        });
                    }
                });

                if (reorderAttempts >= 10) {
                    clearInterval(reorderIntervalId); // Stop after 10 attempts
                    console.log('Stopped reordering after 10 attempts');
                }
            }, 6000); // Check and reorder every 6 seconds

            updateNextMp3(); // Ensure the next MP3 is scheduled to play

            // Setup channels for MP3s scheduled at the same time
            const groupedByTime = {}; // Initialize an object to group MP3s by their scheduled time
            data.mp3s.forEach(mp3 => { // Loop through each MP3
                const time = new Date(mp3.audio_scheduled_time_to_play).getTime(); // Convert the scheduled play time to a timestamp
                if (!groupedByTime[time]) { // If there is no entry for this time, create an empty array
                    groupedByTime[time] = [];
                }
                groupedByTime[time].push(mp3); // Add the MP3 to the array for this time
            });

            // Loop through each time in the groupedByTime object
            Object.keys(groupedByTime).forEach(time => {
                setupChannels(groupedByTime[time]); // Setup channels for the MP3s scheduled at this time
            });
        } else {
            console.error('Failed to retrieve scheduled MP3s: ' + data.message); // Log an error message if retrieval fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log an error message if there's an error during fetch
    });

















    // ********Triggered AFTER DOM Loaded************** Part 7  NOT IN WORKING AUDIOS, I CHECKED -11:38pm on 1/16/25

// Function to add MP3 or video to the schedule
function addMp3ToSchedule(id, url, title, description, playTime, logoUrl, audioUrl, videoUrl) {
    if (!id || !playTime) { // Check if ID or playTime is invalid
        console.error('Invalid ID or playTime:', { id, playTime }); // Log an error message
        return; // Exit the function
    }

    // Log the schedule details
    console.log('Adding to schedule:', { id, url, title, description, playTime, logoUrl });

    // Get the calendar container
    const scheduleContainer = document.getElementById('scheduleContainer');
    const eventDate = new Date(playTime).toDateString(); // Convert the play time to a date string
    let dateSlot = Array.from(scheduleContainer.children).find(child => child.dataset.date === eventDate); // Find the date slot in the container

    // Check if date slot exists, otherwise create it
    if (!dateSlot) {
        dateSlot = document.createElement('div'); // Create a new div for the date slot
        dateSlot.dataset.date = eventDate; // Set the date attribute
        dateSlot.classList.add(playTime <= Date.now() ? "past-day" : "future-day"); // Add appropriate class based on past or future
        dateSlot.textContent = eventDate; // Set the date slot text
        scheduleContainer.appendChild(dateSlot); // Append the date slot to the container
    }

    // Check if event already exists, otherwise create it
    let existingEvent = dateSlot.querySelector(`#event-${id}`);
    if (!existingEvent) {
        existingEvent = document.createElement('p'); // Create a new paragraph for the event
        existingEvent.id = `event-${id}`; // Set the event ID
        existingEvent.style.color = "white"; // Set the text color
        existingEvent.innerHTML = `
            <div>${new Date(playTime).toLocaleTimeString()} 
            <span style="cursor: pointer;" onclick="playMedia('${audioUrl}', '${videoUrl}')">►</span> <span style="font-weight:bold; background: linear-gradient(10deg, #f7ec9c, #ff8651);-webkit-background-clip: text; color: transparent;">${title ? `${title}` : ""}</span>
            ${description ? `${description}` : ""}
            ${logoUrl ? `<p id="logo-${id}"><img src="../uploads/${logoUrl}" alt="Loading..." style="max-width: 100px; max-height: 100px; object-fit: contain; vertical-align: middle;"></p>` : ""}
            
                
                ID: ${id}
            
        </div>
        `;
        dateSlot.appendChild(existingEvent); // Append the event to the date slot

        // Add loading GIF if the logo file exists and image hasn't been loaded
        if (logoUrl && !loadedImages[id]) {
            const logoContainer = document.getElementById(`logo-${id}`);
            logoContainer.innerHTML = '<img src="/includes/UminionRadioGIFversion06.gif" alt="Loading..." style="width: 100px; height: 100px;">';
            checkAndUpdateLogo(id, logoUrl, 0); // Check and update the logo
        }
    }
}









// ********Triggered AFTER DOM Loaded************** Part 8  NOT IN WORKING AUDIOS, I CHECKED -11:38pm on 1/16/25

// Function to play the media (attach to global window object)
window.playMedia = function(audioUrl, videoUrl) {
    const videoContainer = document.getElementById('headerRightContainer002.01'); // Get the video container element
    if (!videoContainer) {
        console.error('headerRightContainer002.01 element not found'); // Log an error message if the container is not found
        return; // Exit the function
    }
    videoContainer.innerHTML = `
        <video controls autoplay>
            ${audioUrl ? `<source src="../uploads/${audioUrl}" type="audio/mpeg">` : ''} <!-- Add audio source if available -->
            ${videoUrl ? `<source src="../uploads/${videoUrl}" type="video/webm">` : ''} <!-- Add video source in webm format if available -->
            ${videoUrl ? `<source src="../uploads/${videoUrl.replace('.webm', '.mp4')}" type="video/mp4">` : ''} <!-- Add video source in mp4 format if available -->
            Your browser does not support the video tag.
        </video>
    `;
}







// ********Triggered AFTER DOM Loaded************** Part 9

  }); //<<<Dont delete these fellahs, i think (This is the ending of the "Triggered AFTER DOM Loaded")








// ********NotDOMed**************Part 21 (Checked: "Was, in, working audio")




// Function to create channels for scheduled audios 5 seconds before playtime
function createChannelsBeforePlaytime(playTime) {
    const channelsContainer = document.getElementById('Channels'); // Get the channels container element
    const channelsToCreate = mp3Schedule.filter(mp3 => mp3.time === playTime); // Filter MP3s scheduled at the specified play time
    
    channelsToCreate.forEach((mp3, index) => {
        const channelNumber = index + 2; // Channel 1 is for sequential playback, so start from 2
        const channelDiv = document.createElement('div'); // Create a new div for the channel
        channelDiv.id = `channel${channelNumber}`; // Set the ID for the channel div
        channelDiv.innerHTML = `
            <h2 style="color: black;">
                Ch: ${channelNumber}
                <p>${new Date(mp3.time).toLocaleTimeString()} - ${mp3.title}</p>
                <p>Starts in 5 seconds</p>
                <audio id="audio${channelNumber}" src="${mp3.audioUrl}" controls style="display: none;"></audio>
            </h2>
        `; // Set the inner HTML for the channel div
        channelsContainer.appendChild(channelDiv); // Append the channel div to the channels container
    });

    // Add navigation arrows if multiple channels exist
    if (channelsToCreate.length > 1) {
        channelsContainer.innerHTML += `
            <button id="prevChannel" style="display:inline;">⬅️</button>
            <button id="nextChannel">➡️</button>
        `; // Add navigation arrows to the channels container

        document.getElementById('nextChannel').addEventListener('click', () => {
            currentChannel = currentChannel === channelsToCreate.length + 1 ? 1 : currentChannel + 1; // Update the current channel to the next one
            updateChannelDisplay(); // Update the channel display
        });

        document.getElementById('prevChannel').addEventListener('click', () => {
            currentChannel = currentChannel === 1 ? channelsToCreate.length + 1 : currentChannel - 1; // Update the current channel to the previous one
            updateChannelDisplay(); // Update the channel display
        });

        // Initial display update
        updateChannelDisplay(); // Call the function to update the display initially
    }
}
















// ********NotDOMed**************Part 22 (Checked: "Was, in, working audio")






// Function to update the channel display based on currentChannel
function updateChannelDisplay() {
    const channelsContainer = document.getElementById('Channels');
    Array.from(channelsContainer.children).forEach((child, index) => {
        child.style.display = (index + 1 === currentChannel) ? 'block' : 'none';
    });

    const prevChannelButton = document.getElementById('prevChannel');
    const nextChannelButton = document.getElementById('nextChannel');
    prevChannelButton.style.display = 'inline';
    nextChannelButton.style.display = 'inline';
}











// ********NotDOMed**************Part 23 (Checked: "Was, in, working audio")








// Function to start playing the scheduled MP3s at the scheduled time
function startScheduledPlayback() {
    const now = new Date().getTime();
    mp3Schedule.forEach(mp3 => {
        const playTime = mp3.time - now;
        if (playTime > 0) {
            setTimeout(() => {
                playMp3(mp3.id, mp3.title, mp3.audioUrl, mp3.description, mp3.logoUrl, mp3Schedule.indexOf(mp3) + 1);
                // Hide the channel after 10 minutes of audio end
                setTimeout(() => {
                    const channelDiv = document.getElementById(`channel${mp3Schedule.indexOf(mp3) + 2}`);
                    if (channelDiv) {
                        channelDiv.style.display = 'none';
                    }
                }, 10 * 60 * 1000); // 10 minutes after audio ends
            }, playTime);
        }
    });
}















// ********NotDOMed**************Part 24 (Checked: "Was, in, working audio")





// Function to handle setting up channels for scheduled audios 5 seconds before playtime
function setupPrePlaytimeChannels() {
    mp3Schedule.forEach(mp3 => {
        const fiveSecondsBeforePlaytime = mp3.time - (5 * 1000);
        const now = new Date().getTime();
        const timeUntilShowChannel = fiveSecondsBeforePlaytime - now;
        if (timeUntilShowChannel > 0) {
            setTimeout(() => {
                createChannelsBeforePlaytime(mp3.time);
            }, timeUntilShowChannel);
        }
    });
}














// ********NotDOMed**************Part 25 (Checked: "Was, in, working audio")





// Initialize channels setup on page load
document.addEventListener("DOMContentLoaded", () => {
    setupPrePlaytimeChannels();
    startScheduledPlayback();
});

















// ********NotDOMed**************Part 26 (Checked: "Was, in, working audio")







// Function to add completed MP3s to the archive
function addMp3ToArchive(audioId, mp3Title, mp3Description, logoUrl, audioUrl) {
    const archiveContainer = document.getElementById('bottomArchiveContainer'); // Get the container for the archive

    const archiveItem = document.createElement('div'); // Create a new div element for the archive item
    archiveItem.innerHTML = `
        <div>
            <p>ID: ${audioId}</p> <!-- Adding the audio ID to the archive -->
            <p>${mp3Title}</p> <!-- Adding the MP3 title to the archive -->
            ${mp3Description ? `<p>${mp3Description}</p>` : ""} <!-- Adding the MP3 description if available -->
            ${logoUrl ? `<img src="../uploads/${logoUrl}" alt="Logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">` : ""} <!-- Adding the logo if available -->
            <audio src="../uploads/${audioUrl}" controls></audio> <!-- Adding the audio player with the MP3 URL -->
        </div>
    `;
    // Prepend the new item to the top of the archive list
    archiveContainer.insertBefore(archiveItem, archiveContainer.firstChild); // Insert the new archive item at the beginning of the container

    manageArchiveVisibility(); // Update visibility after adding new item
}










// ********NotDOMed**************Part 27 (Checked: "Was, in, working audio")







// Add an event listener to the upload MP3 button
document.getElementById('uploadMp3Btn').addEventListener('click', function() {
    console.log("Upload MP3 button clicked"); // Log the action for debugging

    const input = document.getElementById('fileInput'); // Get the file input element
    if (input) {
        input.click(); // Trigger the file input click
    } else {
        console.error("Element with ID 'fileInput' not found."); // Log an error message if the file input is not found
    }
});



















// ********NotDOMed**************Part 28 (Checked: "Was, in, working audio")




// Ensure the file input changes properly
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        console.log("MP3 file selected:", file.name); // Log the file name for debugging
        document.getElementById("mp3Details").style.display = "block"; // Show additional fields
        document.getElementById("uploadMp3Btn").disabled = true; // Disable upload button after selection
        document.getElementById("uploadLogoBtn").style.display = "inline"; // Show the upload logo button
    }
});





















// ********NotDOMed**************Part 29 (Checked: "Was, in, working audio")






// Function to handle upvoting for Historical Archive MP3s
function voteUp(audioId, button) {
    fetch('includes/voteUp.php', {
        method: 'POST', // Use the POST method
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
        },
        body: `audio_id=${audioId}` // Set the request body with the audio ID
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json(); // Parse the response as JSON if the content type is JSON
        } else {
            return response.text().then(text => { throw new Error(text); }); // Otherwise, parse as text and throw an error
        }
    })
    .then(data => {
        if (data.status === 'success') {
            console.log("Upvote recorded successfully"); // Log success message
            button.classList.add('clicked'); // Add the 'clicked' class to the button
            button.nextSibling.classList.remove('clicked'); // Remove the 'clicked' state from the downvote button
        } else {
            console.error("Failed to record upvote: " + data.message); // Log an error message if the upvote fails
        }
    })
    .catch(error => {
        console.error('Error:', error.message); // Log an error message if there's an error during fetch
    });
}























// ********NotDOMed**************Part 30 (Checked: "Was, in, working audio")




// Function to handle downvoting for Historical Archive MP3s
function voteDown(audioId, button) {
    fetch('includes/voteDown.php', { // Send a POST request to voteDown.php
        method: 'POST', // Use the POST method
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
        },
        body: `audio_id=${audioId}` // Set the request body with the audio ID
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json(); // Parse the response as JSON if the content type is JSON
        } else {
            return response.text().then(text => { throw new Error(text); }); // Otherwise, parse as text and throw an error
        }
    })
    .then(data => {
        if (data.status === 'success') {
            console.log("Downvote recorded successfully"); // Log success message
            button.classList.add('clicked'); // Add the 'clicked' class to the button
            button.previousSibling.classList.remove('clicked'); // Remove the 'clicked' state from the upvote button
        } else {
            console.error("Failed to record downvote: " + data.message); // Log an error message if the downvote fails
        }
    })
    .catch(error => {
        console.error('Error:', error.message); // Log an error message if there's an error during fetch
    });
}



















// ********NotDOMed**************Part 31 (Checked: "Was, in, working audio")





// Function to handle upvoting for Popularity Archive MP3s
function voteUp(audioId, button) {
    fetch('includes/voteUp.php', { // Send a POST request to voteUp.php
        method: 'POST', // Use the POST method
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
        },
        body: `audio_id=${audioId}` // Set the request body with the audio ID
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json(); // Parse the response as JSON if the content type is JSON
        } else {
            return response.text().then(text => { throw new Error(text); }); // Otherwise, parse as text and throw an error
        }
    })
    .then(data => {
        if (data.status === 'success') {
            console.log("Upvote recorded successfully"); // Log success message
            button.classList.add('clicked'); // Add the 'clicked' class to the button
            button.nextSibling.classList.remove('clicked'); // Remove the 'clicked' state from the downvote button
        } else {
            console.error("Failed to record upvote: " + data.message); // Log an error message if the upvote fails
        }
    })
    .catch(error => {
        console.error('Error:', error.message); // Log an error message if there's an error during fetch
    });
}
















// ********NotDOMed**************Part 32  (Checked: "Was, in, working audio")





// Function to handle downvoting for Popularity Archive MP3s
function voteDown(audioId, button) {
    fetch('includes/voteDown.php', { // Send a POST request to voteDown.php
        method: 'POST', // Use the POST method
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Set the content type header
        },
        body: `audio_id=${audioId}` // Set the request body with the audio ID
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json(); // Parse the response as JSON if the content type is JSON
        } else {
            return response.text().then(text => { throw new Error(text); }); // Otherwise, parse as text and throw an error
        }
    })
    .then(data => {
        if (data.status === 'success') {
            console.log("Downvote recorded successfully"); // Log success message
            button.classList.add('clicked'); // Add the 'clicked' class to the button
            button.previousSibling.classList.remove('clicked'); // Remove the 'clicked' state from the upvote button
        } else {
            console.error("Failed to record downvote: " + data.message); // Log an error message if the downvote fails
        }
    })
    .catch(error => {
        console.error('Error:', error.message); // Log an error message if there's an error during fetch
    });
}






// ***************************************** This area above, is for: "Video implementation" ******************************************************



// ***************************************** This area below, is for: "Video implementation" ******************************************************

// ********Video**************Part 0

//>>>>>>>>> Commented out, cause its already declared in 'audio'>>>>>>>>> let mediarecorder = null; ((((((((((technically, it was over in video, but i moved it to audio so its showing up earlier -5:33pm on 1/16/25))))))))))
let recordedChunks = []; // Initialize an array to store recorded chunks
let isRecording = false; // Flag to check if recording is in progress
let stream = null; // Variable to store the media stream
let cameraIndex = 0; // Index to track the current camera
let cameras = []; // Array to store available cameras
let cameraStreams = []; // Array to store camera streams
let videoSchedule = []; // Initialize empty array for scheduled video entries
let recentlyPlayed002 = []; // Array to store recently played videos
let gifInterval; // Variable to store the GIF interval
const gifs002 = [ // Array of GIFs for recording animation
    "/includes/UminionVideoGIFversion01.gif",
    "/includes/UminionVideoGIFversion02.gif"
];

const BASE_PATH = '../uploads/'; // Base path for uploads
window.isPlaying = false; // Initialize the isPlaying flag



// ********VideoDOM**************Part 1

// Initialize the schedule on page load
document.addEventListener('DOMContentLoaded', () => {
    generateSchedule(); // Call the function to generate the schedule
    checkScheduledVideos(); // Call to fetch and update calendar entries on page load
    setInterval(checkScheduledVideos, 30000); // Check every 30 seconds
    setInterval(updateCalendarEntriesDaily, 86400000); // Update the calendar entries daily (every 24 hours)
});



// ********Video**************Part 2




async function checkScheduledVideos() {
    const now = new Date().getTime(); // Get the current time in milliseconds
    try {
        const response = await fetch('includes/getScheduledVideos.php'); // Fetch scheduled videos from the server
        const data = await response.json(); // Parse the response as JSON

        if (data.length > 0) {
            console.log('Fetched scheduled videos:', data); // Log the fetched data

            // Apply filtering: Exclude entries older than 14 days from scheduled play time
            const filteredData = data.filter(video => {
                const scheduledTime = new Date(video.audio_scheduled_time_to_play).getTime();
                return scheduledTime >= (now - (14 * 24 * 60 * 60 * 1000)); // Keep only valid entries
            });

            window.videoQueue = filteredData.sort((a, b) => new Date(a.audio_scheduled_time_to_play) - new Date(b.audio_scheduled_time_to_play)); // Sort videos by scheduled play time

            // Update videoSchedule with the filtered data
            window.videoSchedule = filteredData.map(video => ({
                id: video.id, // Video ID
                title: video.video_title || video.audio_title_user_uploaded || '', // Video title or audio title if video title is not available
                description: video.video_description || video.audio_description || '', // Video description or audio description if video description is not available
                scheduledTime: new Date(video.audio_scheduled_time_to_play).getTime(), // Convert to timestamp
                logoFile: video.video_logo_url || '', // Ensure correct field for logo URL
                played: false // Flag to indicate if the video has been played
            }));

            // Ensure past videos are properly removed
            window.videoSchedule = window.videoSchedule.filter(entry => entry.scheduledTime > now); // Keep only future scheduled videos

            // Update the calendar with the filtered data
            updateCalendarEntries(); // Call the function to refresh the calendar
        } else {
            console.log('No scheduled videos fetched'); // Log if no scheduled videos are fetched
            window.videoQueue = []; // Set the video queue to an empty array
        }

        // Update 'Coming Up Next' section
        updateComingUpNext(); // Call the function to update the 'Coming Up Next' section
    } catch (error) {
        console.error('Error fetching scheduled videos:', error); // Log any errors during fetching
    }
}







// ********Video**************Part 3








function generateSchedule() {
    const scheduleContainer = document.getElementById('scheduleContainer'); // Get the container for the schedule
    const currentDate = new Date(); // Get the current date
    currentDate.setDate(currentDate.getDate() - 17); // Start 17 days before the current date

    for (let i = 0; i < 35; i++) { // 17 days before + 1 current day + 17 days after
        const day = document.createElement('div'); // Create a new div for each day
        day.classList.add('date-header'); // Add the date-header class
        if (i === 17) { // Updated index for the current day
            day.classList.add('current-day'); // Add the current-day class
        } else if (i < 17) {
            day.classList.add('past-day'); // Add the past-day class for days before the current day
        } else {
            day.classList.add('future-day'); // Add the future-day class for days after the current day
        }
        day.dataset.date = currentDate.toDateString(); // Set the data-date attribute to the current date
        day.innerHTML = `<p class="header-text">${currentDate.toDateString()}</p><p class="user-entry"></p>`; // Set the inner HTML for the day div
        scheduleContainer.appendChild(day); // Append the day div to the schedule container
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next date
    }
}













// ********Video**************Part 4





function updateCalendarEntries() {
    const scheduleContainer = document.getElementById('scheduleContainer'); // Get the container for the schedule
    const now = new Date().getTime(); // Get the current time in milliseconds

    // Ensure the existing schedule (14 days before and after) remains intact
    Array.from(scheduleContainer.children).forEach(dayDiv => { // Loop through each day div in the schedule container
        const dayDate = new Date(dayDiv.dataset.date).getTime(); // Get the date of the day div in milliseconds
        dayDiv.dataset.date = new Date(dayDate).toDateString(); // Set the data-date attribute to the date string
        dayDiv.classList.add(dayDate <= now ? "past-day" : "future-day"); // Add the appropriate class based on past or future
        dayDiv.textContent = new Date(dayDate).toDateString(); // Set the text content to the date string

        // Find existing entries in the schedule (but exclude outdated ones)
        const existingEntries = window.videoSchedule.filter(entry => {
            const scheduledTime = new Date(entry.scheduledTime).getTime();
            return scheduledTime >= (now - (14 * 24 * 60 * 60 * 1000)) && new Date(entry.scheduledTime).toDateString() === dayDiv.dataset.date;
        });

        existingEntries.forEach(existingEntry => { // Loop through each existing entry
            // Check if the event already exists in the calendar
            let existingEvent = dayDiv.querySelector(`#event-${existingEntry.id}`);
            if (!existingEvent) { // If the event doesn't exist
                // Create a new event div if it doesn't exist
                existingEvent = document.createElement('div'); // Create a new div for the event
                existingEvent.id = `event-${existingEntry.id}`; // Set the event ID
                existingEvent.style.color = "white"; // Set the text color to white
                existingEvent.innerHTML = `
                    <div>${new Date(existingEntry.scheduledTime).toLocaleTimeString()} 
                    <span style="font-weight:bold; background: linear-gradient(10deg, #f7ec9c, #ff8651);-webkit-background-clip: text; color: transparent;">${existingEntry.title ? `${existingEntry.title}` : ""}</span>
                    ${existingEntry.description ? `${existingEntry.description}` : ""}
                    ${existingEntry.logoFile ? `<p id="logo-${existingEntry.id}"><img src="../uploads/${existingEntry.logoFile}" alt="Loading..." style="max-width: 100px; max-height: 100px; object-fit: contain; vertical-align: middle;"></p>` : ""}
                </div>
                `; // Set the inner HTML for the event div
                dayDiv.appendChild(existingEvent); // Append the event div to the day div
            }
        });
    });
}












// ********Video**************Part 5



function updateCalendarEntriesDaily() {
    const scheduleContainer = document.getElementById('scheduleContainer'); // Get the container for the schedule
    const now = new Date().getTime(); // Get the current time in milliseconds

    Array.from(scheduleContainer.children).forEach(dayDiv => { // Loop through each day div in the schedule container
        const dayDate = new Date(dayDiv.dataset.date).getTime(); // Get the date of the day div in milliseconds
        const dayLimitField = dayDiv.querySelector('.day-limit'); // Get the day limit field element
        let dayLimit = parseInt(dayLimitField.textContent, 10) || 0; // Parse the day limit as an integer or set to 0 if not available
        dayLimit += 1; // Increment the day limit
        dayLimitField.textContent = dayLimit; // Update the day limit text

        // Ensure outdated days are removed
        if (dayLimit >= 15 || dayDate < (now - (14 * 24 * 60 * 60 * 1000))) { // Check if the day limit exceeds 15 or if entry is older than 14 days
            scheduleContainer.removeChild(dayDiv); // Remove the day div from the schedule container
        }
    });
}
















// ********Video**************Part 6






function playScheduledVideo() {
    const now = new Date().getTime(); // Get the current time in milliseconds
    const nextVideo = videoSchedule.find(entry => entry.scheduledTime <= now && !entry.played); // Find the next scheduled video that hasn't been played

    if (nextVideo && !window.isPlaying) { // Check if a next video is found and no video is currently playing
        playNextInQueue(); // Play the next video in the queue
        nextVideo.played = true; // Mark this video as played
    }
}


























// ********Video**************Part 7




// Set interval to check and play the scheduled video every 10 seconds
setInterval(playScheduledVideo, 10000);


























// ********Video**************Part 8 ***Update:> "(I believe this sometimes? is the one that shows up to play? i really got no clue. its either this one or: "// ********VideoBACKUP**************Part 5")





function playNextInQueue() {
    if (window.videoQueue.length > 0 && !window.isPlaying) { // Check if there are videos in the queue and no video is currently playing
        const nextVideo = window.videoQueue.shift(); // Remove and get the next video from the queue
        let videoOrders = nextVideo.video_orders ? JSON.parse(nextVideo.video_orders) : [0, 1]; // Parse video orders or set default

        // Convert videoOrders to zero-based indices
        videoOrders = videoOrders.map(order => order - 1); // Convert to zero-based indices

        let videoUrl = nextVideo.audio_url ? `${BASE_PATH}${nextVideo.audio_url}` : null; // Get the video URL for audio
        const fallbackUrl = nextVideo.video_url ? `${BASE_PATH}${nextVideo.video_url}` : null; // Get the fallback URL for video
        let checkboxTwoVideoUrlWebm = nextVideo.checkbox_two_video_url_webm ? `${BASE_PATH}${nextVideo.checkbox_two_video_url_webm}` : null; // Get the WebM video URL
        let checkboxTwoVideoUrlMp4 = nextVideo.checkbox_two_video_url_mp4 ? `${BASE_PATH}${nextVideo.checkbox_two_video_url_mp4}` : null; // Get the MP4 video URL

        // Define primaryContainer
        const container = document.getElementById('headerRightContainer002'); // Get the container for the video
        container.innerHTML = ''; // Clear any existing content

        const primaryContainer = document.createElement('div'); // Create a new div element for the primary container
        primaryContainer.id = 'primaryContainer'; // Set the ID for the primary container
        primaryContainer.style.display = 'flex'; // Use flexbox for layout
        primaryContainer.style.flexDirection = 'row'; // Arrange items in a row
        primaryContainer.style.maxWidth = '600px'; // Set the maximum width of the primary container
        primaryContainer.style.margin = '0 auto'; // Center the primary container
        primaryContainer.style.justifyContent = 'space-between'; // Ensure even spacing between items
        primaryContainer.style.transform = 'scale(0.99) translate(-5px, -175px)'; // *********************** SPECIAL NOTE:> ZZZ001:> PART 1 of 4:>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHANGE THIS (the two numbers in paranathases are X axis and Y axis) TO CHANGE WHERE THE PRIMARY CONTAINER & SECONDARY CONTAINER (and its size) SHOULD BE LOCATED (the ones that appear ABOVE and BELOW the SCHEDULED LIVE/PLAYING VIDEO! -12:13am on 2/25/25)
        primaryContainer.style.transformOrigin = 'top left'; // Ensure scaling happens from the top-left corner


        // Define primaryContainerLeft
        const primaryContainerLeft = document.createElement('div'); // Create a new div element for the left container
        primaryContainerLeft.id = 'primaryContainerLeft'; // Set the ID for the left container
        primaryContainerLeft.style.display = 'flex'; // Use flexbox for layout
        primaryContainerLeft.style.justifyContent = 'flex-start'; // Align items to the left
        primaryContainerLeft.style.alignItems = 'flex-start'; // Align items to the top
        primaryContainerLeft.style.flex = '0 0 150px'; // Fixed width for the left container

        // Display main title, description, and logo above the video
        if (nextVideo.video_logo_url) { // Check if the video has a logo URL
            const logoElement = document.createElement('img'); // Create an img element for the logo
            logoElement.src = `${BASE_PATH}${nextVideo.video_logo_url}`; // Set the source of the logo image
            logoElement.style.maxWidth = '150px'; // Adjust size as needed
            logoElement.style.maxHeight = '150px'; // Adjust size as needed
            primaryContainerLeft.appendChild(logoElement); // Append the logo element to the left container
        }

        // Define primaryContainerCenter
        const primaryContainerCenter = document.createElement('div'); // Create a new div element for the center container
        primaryContainerCenter.id = 'primaryContainerCenter'; // Set the ID for the center container
        primaryContainerCenter.style.display = 'flex'; // Use flexbox for layout
        primaryContainerCenter.style.flexDirection = 'column'; // Arrange items in a column
        primaryContainerCenter.style.alignItems = 'center'; // Center items horizontally
        primaryContainerCenter.style.flex = '1'; // Take up remaining space
        primaryContainerCenter.style.maxWidth = '300px'; // Set the maximum width for the center container

        // Container for title and vote buttons
        const titleVoteContainer = document.createElement('div'); // Create a new div element for the title and vote buttons container
        titleVoteContainer.style.display = 'flex'; // Use flexbox for layout
        titleVoteContainer.style.flexDirection = 'row'; // Arrange items in a row
        titleVoteContainer.style.alignItems = 'center'; // Center items vertically

        const titleContainer = document.createElement('div'); // Create a new div element for the title container
        titleContainer.style.textAlign = 'center'; // Center title within its container
        titleContainer.style.flex = '1'; // Allow the title to take up remaining space

        if (nextVideo.video_title) { // Check if the video has a title
            const titleElement = document.createElement('h2'); // Create an h2 element for the title
            titleElement.textContent = nextVideo.video_title; // Set the text content of the title
            titleContainer.appendChild(titleElement); // Append the title element to the title container
        }
        titleVoteContainer.appendChild(titleContainer); // Append the title container to the title and vote buttons container

        // Function to add upvote and downvote arrows
        function addUpvoteDownvoteButtons(titleVoteContainer, videoId) {
            console.log('Adding upvote and downvote buttons for video ID:', videoId);

            const upvoteButton = document.createElement('button'); // Create a button element for upvote
            upvoteButton.innerHTML = '⬆️'; // Upvote arrow
            upvoteButton.onclick = function () {
                updateVote(videoId, 'upvote'); // Add onclick event to update the vote
            };

            const downvoteButton = document.createElement('button'); // Create a button element for downvote
            downvoteButton.innerHTML = '⬇️'; // Downvote arrow
            downvoteButton.onclick = function () {
                updateVote(videoId, 'downvote'); // Add onclick event to update the vote
            };

            // Creating a container to hold the arrows
            const voteContainer = document.createElement('div'); // Create a div element for the vote container
            voteContainer.style.display = 'flex'; // Use flexbox for layout
            voteContainer.style.flexDirection = 'column'; // Stack buttons vertically
            voteContainer.style.marginRight = '10px'; // Add margin to the right of the buttons
            voteContainer.appendChild(upvoteButton); // Append the upvote button to the vote container
            voteContainer.appendChild(downvoteButton); // Append the downvote button to the vote container

            // Adding the voteContainer to the left of the title
            titleVoteContainer.insertBefore(voteContainer, titleContainer); // Insert the vote container before the title container
        }

        // Call the function with appropriate parameters
        addUpvoteDownvoteButtons(titleVoteContainer, nextVideo.id); // Add upvote and downvote buttons to the titleVoteContainer
        primaryContainerCenter.appendChild(titleVoteContainer); // Append the title and vote buttons container to the center container

        if (nextVideo.video_description) { // Check if the video has a description
            const descriptionElement = document.createElement('p'); // Create a p element for the description
            descriptionElement.textContent = nextVideo.video_description; // Set the text content of the description
            primaryContainerCenter.appendChild(descriptionElement); // Append the description element to the center container
        }

        // Define primaryContainerRight
        const primaryContainerRight = document.createElement('div'); // Create a new div element for the right container
        primaryContainerRight.id = 'primaryContainerRight'; // Set the ID for the right container
        primaryContainerRight.style.display = 'flex'; // Use flexbox for layout
        primaryContainerRight.style.justifyContent = 'flex-end'; // Align items to the right
        primaryContainerRight.style.alignItems = 'flex-start'; // Align items to the top
        primaryContainerRight.style.flex = '0 0 150px'; // Fixed width for the right container

        // Display main title, description, and logo above the video
        if (nextVideo.video_logo_url) { // Check if the video has a logo URL
            const logoElement = document.createElement('img'); // Create an img element for the logo
            logoElement.src = `${BASE_PATH}${nextVideo.video_logo_url}`; // Set the source of the logo image
            logoElement.style.maxWidth = '150px'; // Adjust size as needed
            logoElement.style.maxHeight = '150px'; // Adjust size as needed
            primaryContainerRight.appendChild(logoElement); // Append the logo element to the right container
        }

        // Append containers to primaryContainer
        primaryContainer.appendChild(primaryContainerLeft); // Append the left container to the primary container
        primaryContainer.appendChild(primaryContainerCenter); // Append the center container to the primary container
        primaryContainer.appendChild(primaryContainerRight); // Append the right container to the primary container

        // Append primaryContainer to main container
        container.appendChild(primaryContainer); // Append the primary container to the main container


        // Function to update vote counts in the database
        function updateVote(videoId, voteType) {
            const xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object
            let url;
            if (voteType === 'upvote') {
                url = 'includes/voteUp.php'; // Set the URL for upvote
            } else if (voteType === 'downvote') {
                url = 'includes/voteDown.php'; // Set the URL for downvote
            } else {
                console.error('Invalid vote type'); // Log an error message if the vote type is invalid
                return; // Exit the function
            }
            xhr.open('POST', url, true); // Open a POST request to the URL
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); // Set the request header
            xhr.onload = function () {
                if (xhr.status === 200) { // Check if the request was successful
                    console.log('Vote updated successfully'); // Log success message
                }
            };
            xhr.send(`audio_id=${videoId}&type=video`); // Send the request with the video ID and type as parameters
        }

        const videoElement = document.createElement('video'); // Create a new video element
        videoElement.controls = true; // Enable video controls
        videoElement.style.width = '100%'; // Make the video fit the container
        videoElement.style.maxWidth = '300px'; // Set a maximum width of 300px to help control size of video
        videoElement.style.transform = 'translate(25px, -175px)'; // *************************SPECIAL NOTE YYY001 PART 1 of 2:>>>>>>>>>>>>>>>>>>>>>>>  CHANGE BOTH THIS ENTRY, AND THE OTHER PART (part 1 of 2 AND part 2 of 2) TO CHANGE SIZE AND LOCATION OF WHERE THE VIDEO SHOWS UP) -12:10am on -2/5/25

        const sources = [
            { webm: videoUrl, mp4: fallbackUrl }, // Set sources for the primary video
            { webm: checkboxTwoVideoUrlWebm, mp4: checkboxTwoVideoUrlMp4 } // Set sources for the secondary video
        ];

        // Move the image to the left by 30px
const bannerImage = document.querySelector('.innerDivBelowPlacard');
bannerImage.style.left = '20px'; // Adjust the left position by -30px from 50%

// Change the min-height to 950px
const topLeftSection = document.querySelector('.containerForTopLeftSection');
topLeftSection.style.minHeight = '950px !important'; // Change the min-height to 950px <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 2 of 11  <<< 

        // Append relevant secondary inputs for the playing video
        const appendSecondaryInputs = (videoData, order) => {
            const checkboxNumber = order === 0 ? 'one' : 'two'; // Determine the checkbox number
            const secondaryTitleField = `checkbox_${checkboxNumber}_video_title`; // Set the secondary title field
            const secondaryDescriptionField = `checkbox_${checkboxNumber}_video_description`; // Set the secondary description field
            const secondaryLogoField = `checkbox_${checkboxNumber}_video_logo_url`; // Set the secondary logo field

            // Create the secondary container with the new structure
            const secondaryContainer = document.createElement('div'); // Create a new div for the secondary container
            secondaryContainer.id = 'secondaryContainer'; // Set the ID for the secondary container
            secondaryContainer.style.maxWidth = '600px'; // Set the maximum width for the secondary container
            secondaryContainer.style.display = 'flex'; // Use flexbox for layout
            secondaryContainer.style.flexDirection = 'column'; // Arrange items in a column
            secondaryContainer.style.margin = '0 auto'; // Center the secondary container
            secondaryContainer.style.transform = 'scale(0.99) translate(85px, -215px)'; // *********************** SPECIAL NOTE:> ZZZ001:> PART 2 of 4:>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHANGE THIS (the two numbers in paranathases are X axis and Y axis) TO CHANGE WHERE THE PRIMARY CONTAINER & SECONDARY CONTAINER (and its size) SHOULD BE LOCATED (the ones that appear ABOVE and BELOW the SCHEDULED LIVE/PLAYING VIDEO! -12:13am on 2/25/25)
            secondaryContainer.style.transformOrigin = 'top left'; // Ensure scaling happens from the top-left corner

            const secondaryContainerTop = document.createElement('div'); // Create a new div for the top part of the secondary container
            secondaryContainerTop.id = 'secondaryContainerTop'; // Set the ID for the top part
            secondaryContainerTop.style.flex = '0 0 90%'; // Set the flex properties
            secondaryContainerTop.style.display = 'flex'; // Use flexbox for layout
            secondaryContainerTop.style.flexDirection = 'row'; // Arrange items in a row

            // Define secondaryContainerBottom
            const secondaryContainerBottom = document.createElement('div'); // Create a new div for the bottom part of the secondary container
            secondaryContainerBottom.id = 'secondaryContainerBottom'; // Set the ID for the bottom part
            secondaryContainerBottom.style.display = 'flex'; // Use flexbox for layout
            secondaryContainerBottom.style.flexDirection = 'row'; // Arrange items in a row
            secondaryContainerBottom.style.flex = '0 0 10%'; // Ensure the container takes up 10% of the available space

            // Define secondaryContainerBottomLeft
            const secondaryContainerBottomLeft = document.createElement('div'); // Create a new div for the left part of the bottom container
            secondaryContainerBottomLeft.id = 'secondaryContainerBottomLeft'; // Set the ID for the left part
            secondaryContainerBottomLeft.style.flex = '0 0 90%'; // Take up 90% of the width
            secondaryContainerBottomLeft.style.display = 'flex'; // Use flexbox for layout
            secondaryContainerBottomLeft.style.justifyContent = 'center'; // Center the content
            secondaryContainerBottomLeft.style.alignItems = 'center'; // Center the content vertically

            // Add the text to secondaryContainerBottomLeft
            secondaryContainerBottomLeft.innerHTML = 'Coming Soon- Tags'; // Placeholder text for the tagsforchannel field, and WAS PREVIOUSLY CALLED: TagsForChannel but got changed to: "Coming Soon- Tags" as of -3:39am on 2/1/25

            // Define secondaryContainerBottomRight
            const secondaryContainerBottomRight = document.createElement('div'); // Create a new div element for the right part of the bottom container
            secondaryContainerBottomRight.id = 'secondaryContainerBottomRight'; // Set the ID for the right part
            secondaryContainerBottomRight.style.flex = '0 0 10%'; // Take up 10% of the width
            secondaryContainerBottomRight.style.display = 'flex'; // Use flexbox for layout
            secondaryContainerBottomRight.style.justifyContent = 'center'; // Center the content horizontally
            secondaryContainerBottomRight.style.alignItems = 'center'; // Center the content vertically

            // Assuming you have the audio_id variable
            const audioId = nextVideo.id; // Replace this with the actual audio_id variable you have
            secondaryContainerBottomRight.innerHTML = `ID: ${audioId}`; // Set the text content for the right part

            // Append the left and right containers to secondaryContainerBottom
            secondaryContainerBottom.appendChild(secondaryContainerBottomLeft); // Append the left part to the bottom container
            secondaryContainerBottom.appendChild(secondaryContainerBottomRight); // Append the right part to the bottom container

            // Assuming there's a parent container to append secondaryContainerBottom
            document.body.appendChild(secondaryContainerBottom); // Replace with the appropriate parent container

            const secondaryContainerLeft = document.createElement('div'); // Create a new div element for the left container
            secondaryContainerLeft.id = 'secondaryContainerLeft'; // Set the ID for the left container
            secondaryContainerLeft.style.flex = '0 0 75%'; // Take up 75% of the width
            secondaryContainerLeft.style.display = 'flex'; // Use flexbox for layout
            secondaryContainerLeft.style.flexDirection = 'column'; // Arrange items in a column

            const secondaryContainerLeftTop = document.createElement('div'); // Create a new div element for the top part of the left container
            secondaryContainerLeftTop.id = 'secondaryContainerLeftTop'; // Set the ID for the top part
            secondaryContainerLeftTop.style.flex = '0 0 15%'; // Take up 15% of the height

            const secondaryContainerLeftBottom = document.createElement('div'); // Create a new div element for the bottom part of the left container
            secondaryContainerLeftBottom.id = 'secondaryContainerLeftBottom'; // Set the ID for the bottom part
            secondaryContainerLeftBottom.style.flex = '0 0 85%'; // Take up 85% of the height

            const secondaryContainerRight = document.createElement('div'); // Create a new div element for the right container
            secondaryContainerRight.id = 'secondaryContainerRight'; // Set the ID for the right container
            secondaryContainerRight.style.flex = '0 0 25%'; // Take up 25% of the width
            secondaryContainerRight.style.display = 'flex'; // Use flexbox for layout
            secondaryContainerRight.style.flexDirection = 'column'; // Arrange items in a column

            const secondaryContainerRightTop = document.createElement('div'); // Create a new div element for the top part of the right container
            secondaryContainerRightTop.id = 'secondaryContainerRightTop'; // Set the ID for the top part
            secondaryContainerRightTop.style.flex = '0 0 25%'; // Take up 25% of the height
            secondaryContainerRightTop.innerHTML = 'Coming Soon- Usernames'; // Placeholder text for the username field, and WAS PREVIOUSLY CALLED: URUsername but got changed to: "Coming Soon- Usernames" as of -3:36am on 2/1/25

            const secondaryContainerRightBottom = document.createElement('div'); // Create a new div element for the bottom part of the right container
            secondaryContainerRightBottom.id = 'secondaryContainerRightBottom'; // Set the ID for the bottom part
            secondaryContainerRightBottom.style.flex = '0 0 75%'; // Take up 75% of the height
            secondaryContainerRightBottom.innerHTML = 'Coming Soon- Broadcasting Channels'; // Placeholder text for the broadcasting channel field, and WAS PREVIOUSLY CALLED: BroadCastingChannel00X but got changed to: "Coming Soon- Broadcasting Channels" as of -3:37am on 2/1/25

            // Append secondary title if available
            if (videoData[secondaryTitleField]) { // Check if the secondary title field exists
                const secondaryTitleElement = document.createElement('h3'); // Create an h3 element for the secondary title
                secondaryTitleElement.textContent = videoData[secondaryTitleField]; // Set the text content of the secondary title
                secondaryContainerLeftTop.appendChild(secondaryTitleElement); // Append the secondary title element to the left top container
            }

            // Append secondary description if available
            if (videoData[secondaryDescriptionField]) { // Check if the secondary description field exists
                const secondaryDescriptionElement = document.createElement('p'); // Create a p element for the secondary description
                secondaryDescriptionElement.textContent = videoData[secondaryDescriptionField]; // Set the text content of the secondary description
                secondaryContainerLeftBottom.appendChild(secondaryDescriptionElement); // Append the secondary description element to the left bottom container
            }

            // Append secondary logo if available
            if (videoData[secondaryLogoField]) { // Check if the secondary logo field exists
                primaryContainerRight.innerHTML = ''; // Clear any existing secondary logo content
                const secondaryLogoElement = document.createElement('img'); // Create an img element for the secondary logo
                secondaryLogoElement.src = `${BASE_PATH}${videoData[secondaryLogoField]}`; // Set the source of the secondary logo image
                secondaryLogoElement.style.maxWidth = '150px'; // Adjust size as needed
                secondaryLogoElement.style.maxHeight = '150px'; // Adjust size as needed
                primaryContainerRight.appendChild(secondaryLogoElement); // Append the secondary logo element to the right container
            }

            secondaryContainerLeft.appendChild(secondaryContainerLeftTop); // Append the left top container to the left container
            secondaryContainerLeft.appendChild(secondaryContainerLeftBottom); // Append the left bottom container to the left container

            secondaryContainerRight.appendChild(secondaryContainerRightTop); // Append the right top container to the right container
            secondaryContainerRight.appendChild(secondaryContainerRightBottom); // Append the right bottom container to the right container

            secondaryContainerTop.appendChild(secondaryContainerLeft); // Append the left container to the top container
            secondaryContainerTop.appendChild(secondaryContainerRight); // Append the right container to the top container

            secondaryContainer.appendChild(secondaryContainerTop); // Append the top container to the secondary container
            secondaryContainer.appendChild(secondaryContainerBottom); // Append the bottom container to the secondary container

            container.appendChild(secondaryContainer); // Append the secondary container to the main container
        };


        // Function to play video by order
        const playVideoByOrder = (index) => {
            if (index < videoOrders.length) { // Check if the index is within the bounds of the video orders array
                const order = videoOrders[index]; // Get the order at the current index
                if (order >= 0 && order < sources.length) { // Check if the order is within the bounds of the sources array
                    const source = sources[order]; // Get the source at the specified order
                    if (source && source.webm) { // Check if the source and its webm property are valid
                        videoElement.innerHTML = `<source src="${source.webm}" type="video/webm">`; // Set the webm source for the video element
                        if (source.mp4) { // Check if the source has an mp4 property
                            videoElement.innerHTML += `<source src="${source.mp4}" type="video/mp4">`; // Append the mp4 source to the video element
                        }
                        videoElement.load(); // Load the video element

                        // Play the video and update secondary inputs after it starts
                        videoElement.play().then(() => {
                            container.innerHTML = ''; // Clear any existing secondary content
                            container.appendChild(primaryContainer); // Re-append the primary container
                            container.appendChild(videoElement); // Re-append the video element
                            appendSecondaryInputs(nextVideo, order); // Append secondary inputs for the playing video
                            window.isPlaying = true; // Mark as playing

                            videoElement.onended = () => {
                                updateVideoStatus(nextVideo.id); // Update video status after the video ends
                                addToRecentlyPlayed002(nextVideo, 'video'); // Add to recently played
                                window.isPlaying = false; // Mark as not playing
                                playVideoByOrder(index + 1); // Play the next video in the order

                                // Move the image back to its original position (right by 30px)
    const bannerImage = document.querySelector('.innerDivBelowPlacard');
    bannerImage.style.left = '50%'; // Reset the left position to 50%

    // Change the min-height back to 650px
    const topLeftSection = document.querySelector('.containerForTopLeftSection');
    topLeftSection.style.minHeight = '650px'; // Change the min-height back to 650px <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 3 of 11  <<< 


                            };
                        }).catch(error => {
                            console.error('Error playing video:', error); // Log an error message if there's an error playing the video
                            if (source.mp4) { // Check if the source has an mp4 property
                                videoElement.src = source.mp4; // Set the video element source to the mp4
                                videoElement.play().then(() => {
                                    container.innerHTML = ''; // Clear any existing secondary content
                                    container.appendChild(primaryContainer); // Re-append the primary container
                                    container.appendChild(videoElement); // Re-append the video element
                                    appendSecondaryInputs(nextVideo, order); // Append secondary inputs for the playing video
                                    window.isPlaying = true; // Mark as playing

                                    videoElement.onended = () => {
                                        updateVideoStatus(nextVideo.id); // Update video status after the video ends
                                        addToRecentlyPlayed002(nextVideo, 'video'); // Add to recently played
                                        window.isPlaying = false; // Mark as not playing
                                        playVideoByOrder(index + 1); // Play the next video in the order
                                        
                                        // Move the image back to its original position (right by 30px)
    const bannerImage = document.querySelector('.innerDivBelowPlacard');
    bannerImage.style.left = '50%'; // Reset the left position to 50%

    // Change the min-height back to 650px
    const topLeftSection = document.querySelector('.containerForTopLeftSection');
    topLeftSection.style.minHeight = '650px'; // Change the min-height back to 650px <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 4 of 11  <<< 

                                    };
                                }).catch(fallbackError => console.error('Error playing fallback video:', fallbackError)); // Log an error message if there's an error playing the fallback video
                            }
                        });
                    } else {
                        console.error('Invalid source for order:', order); // Log an error message if the source is invalid
                    }
                } else {
                    console.error('Order out of bounds:', order); // Log an error message if the order is out of bounds
                }
            } else {
                window.isPlaying = false; // No more videos to play, mark as not playing
            }
        };

        // Start playing videos in specified order
        container.appendChild(videoElement); // Append the video element to the container
        playVideoByOrder(0); // Start playing the videos from the first order
    } else {
        // Check again after 10 seconds if no videos are in the queue
        setTimeout(playScheduledVideo, 10000); // Set a timeout to check again after 10 seconds
    }
}




















// ********Video**************Part 9
// ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 1


document.addEventListener('DOMContentLoaded', async function() {

// ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 2


    const submitVideoButton = document.getElementById('submitVideo'); // Get the submit video button element

// ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 3

    const previewContainer = document.getElementById('previewContainer') || createPreviewContainer(); // Get the preview container or create it if it doesn't exist



// ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 4

    window.scheduledCheckActive = true; // To control the scheduled check




    // ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 5

    // Get available cameras
    const devices = await navigator.mediaDevices.enumerateDevices(); // Enumerate available media devices
    cameras = devices.filter(device => device.kind === 'videoinput'); // Filter out the video input devices (cameras)









// ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 6




    document.getElementById('recordButton02').addEventListener('click', async function() {
        if (isRecording) { // Check if currently recording
            await stopRecording(); // Stop recording if already recording
            isRecording = false; // Set isRecording to false

            // Show checkboxes and previews for each recorded segment
            showVideoPreviews(); // Show video previews

            // Show form fields
            toggleFormFields(true); // Toggle form fields to be shown
        } else {
            await startRecording02(); // Start recording if not currently recording
        }
    });









    // ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 7

// Sanitize function for video inputs
function sanitizeVideoInput(input) {
    const div = document.createElement('div'); // Create a new HTML <div> element
    div.appendChild(document.createTextNode(input)); // Insert the user's input as plain text inside the <div>
    return div.innerHTML; // Return the sanitized version of the input
}

if (submitVideoButton) { // Check if submit video button exists
    submitVideoButton.addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const selectedVideoIndexes = Array.from(document.querySelectorAll('input[name="videoSelection"]:checked')).map(cb => cb.value); // Get the selected video indexes
        if (selectedVideoIndexes.length === 0) { // Check if no videos are selected
            showToast00001('Please select at least one video to submit.'); // Display toast notification if no videos are selected
            return; // Exit the function
        }

        const form = document.getElementById('videoForm'); // Get the video form element
        const formData = new FormData(form); // Create a FormData object with the form data

        // Handle the first selected video
        const firstVideoIndex = selectedVideoIndexes[0]; // Get the index of the first selected video
        const firstVideoBlob = new Blob(recordedChunks[firstVideoIndex], { type: 'video/webm' }); // Create a Blob object for the first selected video
        const firstVideoFile = new File([firstVideoBlob], 'recordedVideo1.webm', { type: 'video/webm' }); // Create a File object for the first selected video

        formData.append('videoFile', firstVideoFile); // Append the first selected video file to the FormData object

        // Handle the second selected video, if present
        if (selectedVideoIndexes.length > 1) { // Check if there is a second selected video
            const secondVideoIndex = selectedVideoIndexes[1]; // Get the index of the second selected video
            const secondVideoBlob = new Blob(recordedChunks[secondVideoIndex], { type: 'video/webm' }); // Create a Blob object for the second selected video
            const secondVideoFile = new File([secondVideoBlob], 'recordedVideo2.webm', { type: 'video/webm' }); // Create a File object for the second selected video

            formData.append('videoFile2', secondVideoFile); // Append the second selected video file to the FormData object
        }

        // Sanitize inputs
        const videoTitle = sanitizeVideoInput(document.getElementById('videoTitle').value); // Sanitize the video title
        const videoDescription = sanitizeVideoInput(document.getElementById('videoDescription').value); // Sanitize the video description
        const scheduledTime = document.getElementById('scheduleTime').value; // Scheduled time does not need sanitization here as it's a datetime-local input
        const logoFile = document.getElementById('logoFile').files[0]; // File inputs do not need sanitization

        formData.set('videoTitle', videoTitle); // Append the sanitized video title to the FormData object
        formData.set('videoDescription', videoDescription); // Append the sanitized video description to the FormData object
        formData.set('scheduledTime', scheduledTime); // Append the scheduled time to the FormData object
        formData.set('logoFile', logoFile); // Append the logo file to the FormData object

        // Append video order
        const videoOrders = Array.from(document.querySelectorAll('select[name="videoOrder"]')).map(select => select.value); // Get the video orders from the form
        formData.append('videoOrders', JSON.stringify(videoOrders)); // Append the video orders to the FormData object as a JSON string

        try {
            const response = await fetch('includes/videosubmit.php', { // Submit the form data to the server
                method: 'POST', // Use the POST method
                body: formData // Set the request body to the FormData object
            });
            const data = await response.json(); // Parse the response as JSON
            if (data.status === 'success') { // Check if the submission was successful
                showToast00002('Video submitted successfully'); // Display toast notification for successful submission
                clearFormFieldsAndPreview(); // Clear the form fields and preview
                clearFormFieldsAndButtons(); // Clear the form fields and buttons
                stopGif(); // Stop the GIF animation

                // Add to calendar
                const playTime = new Date(formData.get('scheduledTime')).getTime(); // Get the scheduled play time as a timestamp
                addVideoToCalendar(data.video_id, formData.get('videoTitle'), formData.get('videoDescription'), formData.get('logoFile').name, playTime); // Add the video to the calendar

                // Add to video schedule
                videoSchedule.push({ // Add the video to the video schedule
                    id: data.video_id,
                    title: formData.get('videoTitle'),
                    description: formData.get('videoDescription'),
                    scheduledTime: playTime,
                    logoFile: formData.get('logoFile').name
                });

                // Add to 'coming up next' section
                updateComingUpNext(); // Update the 'coming up next' section

                // Add loading spinner for the logo if provided
                if (formData.get('logoFile')) { // Check if a logo file was provided
                    const logoElementId = `logo-${data.video_id}`; // Create the ID for the logo element
                    const logoContainer = document.getElementById(logoElementId); // Get the logo container element
                    if (logoContainer) { // Check if the logo container element exists
                        logoContainer.innerHTML = '<div class="spinner"></div>'; // Add a loading spinner to the logo container
                        checkAndUpdateLogo(data.video_id, formData.get('logoFile').name); // Check and update the logo
                    }
                }
            } else {
                showToast00003('03Failed to submit video'); // Display toast notification if submission fails
            }
        } catch (error) {
            console.error('Error:', error); // Log any errors that occur during submission
            showToast00004('04Failed to submit video'); // Display toast notification if there's an error
        }
    });
}





// ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 8





    checkScheduledVideos(); // Call this function to start checking for scheduled videos
    setInterval(checkScheduledVideos, 30000); // Check every 30 seconds
    setInterval(playScheduledVideo, 10000); // Check and play scheduled videos every 10 seconds



// ********Triggered AFTER DOM Loaded A SECOND ASYNC ONE!?************** Part 9


}); //<<<<<<<<<<<<<<<This closes this DOM thing 















// ********Video**************Part 10



function toggleFormFields(show) {
    const display = show ? 'block' : 'none'; // Set display style based on the 'show' parameter
    if (document.querySelector('label[for="logoFile"]')) { // Check if the label for logoFile exists
        document.querySelector('label[for="logoFile"]').style.display = display; // Toggle display style for the logoFile label
    }
    if (document.getElementById('logoFile')) { // Check if the logoFile input exists
        document.getElementById('logoFile').style.display = display; // Toggle display style for the logoFile input
    }
    if (document.querySelector('label[for="videoTitle"]')) { // Check if the label for videoTitle exists
        document.querySelector('label[for="videoTitle"]').style.display = display; // Toggle display style for the videoTitle label
    }
    if (document.getElementById('videoTitle')) { // Check if the videoTitle input exists
        document.getElementById('videoTitle').style.display = display; // Toggle display style for the videoTitle input
    }
    if (document.querySelector('label[for="videoDescription"]')) { // Check if the label for videoDescription exists
        document.querySelector('label[for="videoDescription"]').style.display = display; // Toggle display style for the videoDescription label
    }
    if (document.getElementById('videoDescription')) { // Check if the videoDescription input exists
        document.getElementById('videoDescription').style.display = display; // Toggle display style for the videoDescription input
    }
    if (document.querySelector('label[for="scheduleTime"]')) { // Check if the label for scheduleTime exists
        document.querySelector('label[for="scheduleTime"]').style.display = display; // Toggle display style for the scheduleTime label
    }
    if (document.getElementById('scheduleTime')) { // Check if the scheduleTime input exists
        document.getElementById('scheduleTime').style.display = display; // Toggle display style for the scheduleTime input
    }
    if (document.getElementById('submitVideo')) { // Check if the submitVideo button exists
        document.getElementById('submitVideo').style.display = display; // Toggle display style for the submitVideo button
    }
}







// ********Video**************Part 11








function createPreviewContainer() {
    const previewContainer = document.createElement('div'); // Create a new div element for the preview container
    previewContainer.id = 'previewContainer'; // Set the ID for the preview container
    document.body.appendChild(previewContainer); // Append the preview container to the body
    return previewContainer; // Return the created preview container
}















// ********Video**************Part 12











function clearFormFieldsAndPreview() {
    document.getElementById('videoTitle').value = ''; // Clear the value of the videoTitle input
    document.getElementById('videoDescription').value = ''; // Clear the value of the videoDescription input
    document.getElementById('scheduleTime').value = ''; // Clear the value of the scheduleTime input
    document.getElementById('logoFile').value = ''; // Clear the value of the logoFile input
    const previewContainer = document.getElementById('previewContainer') || createPreviewContainer(); // Get or create the preview container
    previewContainer.innerHTML = ''; // Clear all previews in the preview container
}





















// ********Video**************Part 13






function clearFormFieldsAndButtons() {
    document.querySelector('label[for="logoFile"]').style.display = 'none'; // Hide the label for logoFile
    document.getElementById('logoFile').style.display = 'none'; // Hide the logoFile input
    document.querySelector('label[for="videoTitle"]').style.display = 'none'; // Hide the label for videoTitle
    document.getElementById('videoTitle').style.display = 'none'; // Hide the videoTitle input
    document.querySelector('label[for="videoDescription"]').style.display = 'none'; // Hide the label for videoDescription
    document.getElementById('videoDescription').style.display = 'none'; // Hide the videoDescription input
    document.querySelector('label[for="scheduleTime"]').style.display = 'none'; // Hide the label for scheduleTime
    document.getElementById('scheduleTime').style.display = 'none'; // Hide the scheduleTime input
    document.getElementById('submitVideo').style.display = 'none'; // Hide the submitVideo button
}





































// ********Video**************Part 14






async function startRecording02() {
    window.scheduledCheckActive = false; // Pause background tasks
    if (!stream) { // Check if stream is not already initialized
        stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: cameras[cameraIndex].deviceId }, // Get video stream from the current camera
            audio: true // Include audio in the stream
        });
        cameraStreams.push({ stream, cameraIndex }); // Track streams with their indexes
    }

    const preview = document.getElementById('preview'); // Get the preview element
    preview.srcObject = stream; // Set the stream as the source for the preview element
    preview.muted = true; // Mute the preview
    preview.style.display = 'block'; // Show the preview element
    await preview.play(); // Play the preview

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8' }); // Create a MediaRecorder instance with the stream
    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push([event.data]); // Ensure each recording is wrapped in an array
        }
    };

    // Show control buttons
    document.getElementById('pauseButton').style.display = 'block'; // Show the pause button
    document.getElementById('switchCameraButton').style.display = 'block'; // Show the switch camera button

    // Start playing GIFs in random order
    gifInterval = setInterval(playNextGif, 5000); // Change GIF every 5 seconds
    mediaRecorder.start(); // Start the media recorder
    isRecording = true; // Set the recording flag to true
}






















// ********Video**************Part 15







async function stopRecording() {
    mediaRecorder.stop(); // Stop the media recorder
    stream.getTracks().forEach(track => track.stop()); // Stop all tracks in the stream
    clearInterval(gifInterval); // Clear the GIF interval

    const preview = document.getElementById('preview'); // Get the preview element
    preview.srcObject = null; // Clear the source of the preview element
    preview.style.display = 'none'; // Hide the preview element

    await new Promise(resolve => setTimeout(resolve, 100)); // Ensure media stream is fully stopped

    // Reset the image back to the original
    document.getElementById('recordButton02').src = '/includes/UnionRadioLogoVersion002ForUnionRadioWebsite.png';

    // Hide control buttons
    document.getElementById('pauseButton').style.display = 'none'; // Hide the pause button
    document.getElementById('switchCameraButton').style.display = 'none'; // Hide the switch camera button

    window.scheduledCheckActive = true; // Resume background tasks
}


























// ********Video**************Part 16





// Function to play next GIF in random order
function playNextGif() {
    const randomIndex = Math.floor(Math.random() * gifs002.length); // Get a random index for the GIFs array
    document.getElementById('recordButton02').src = gifs002[randomIndex]; // Change the source of the record button to the next GIF
}














// ********Video**************Part 17






// Function to stop GIF and revert to the original image
function stopGif() {
    clearInterval(gifInterval); // Clear the GIF interval
    document.getElementById('recordButton02').src = '/includes/UnionRadioLogoVersion002ForUnionRadioWebsite.png'; // Revert to the original image
}

























// ********Video**************Part 18








// Function to switch camera and restart recording
async function switchCamera() {
    if (isRecording) { // Check if currently recording
        cameraIndex = (cameraIndex + 1) % cameras.length; // Increment the camera index and wrap around if necessary
        mediaRecorder.stop(); // Stop the media recorder
        stream.getTracks().forEach(track => track.stop()); // Stop all tracks in the stream
        stream = null; // Clear the stream
        recordedChunks = []; // Clear previously recorded chunks
        await startRecording02(); // Restart recording with the new camera
    }
}





























// ********Video**************Part 19





document.getElementById('switchCameraButton').addEventListener('click', switchCamera); // Add click event listener to switch camera button




























// ********Video**************Part 20





// Function to pause and unpause recording
function togglePause() {
    if (mediaRecorder.state === 'recording') { // Check if the media recorder is recording
        mediaRecorder.pause(); // Pause the media recorder
        document.getElementById('pauseButton').textContent = 'Unpause'; // Change button text to 'Unpause'
        document.getElementById('preview').pause(); // Pause the live feed preview
    } else if (mediaRecorder.state === 'paused') { // Check if the media recorder is paused
        mediaRecorder.resume(); // Resume the media recorder
        document.getElementById('pauseButton').textContent = 'Pause'; // Change button text to 'Pause'
        document.getElementById('preview').play(); // Resume the live feed preview
    }
}


























// ********Video**************Part 21



document.getElementById('pauseButton').addEventListener('click', togglePause); // Add click event listener to the pause button




























// ********Video**************Part 22





// Function to show video previews with checkboxes, dropdowns, radio buttons, and a save button
function showVideoPreviews() {
    const previewContainer = document.getElementById('previewContainer') || createPreviewContainer(); // Get or create the preview container
    previewContainer.innerHTML = ''; // Clear previous previews
    recordedChunks.forEach((chunks, index) => { // Loop through each recorded chunk
        const videoElement = document.createElement('video'); // Create a video element
        videoElement.controls = true; // Enable video controls
        videoElement.style.width = '160px'; // Set max width
        videoElement.style.height = '80px'; // Set max height
        videoElement.style.zIndex = '90000'; // Set z-index to 90,000
        const blob = new Blob(chunks, { type: 'video/webm' }); // Create a Blob from the recorded chunks
        const url = URL.createObjectURL(blob); // Create a URL for the Blob
        videoElement.src = url; // Set the video source to the Blob URL



// Change the min-height to 950px
const topLeftSection = document.querySelector('.containerForTopLeftSection');
topLeftSection.style.minHeight = '950px !important'; // Change the min-height to 950px <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 5 of 11  <<< 

        const checkboxContainer = document.createElement('div'); // Create a div for the checkbox container
        checkboxContainer.classList.add('checkboxContainer'); // Add class for identification
        checkboxContainer.style.display = 'flex'; // Use flexbox for layout
        checkboxContainer.style.alignItems = 'center'; // Center items vertically

        const checkbox = document.createElement('input'); // Create a checkbox input element
        checkbox.type = 'checkbox'; // Set input type to checkbox
        checkbox.name = 'videoSelection'; // Set the checkbox name
        checkbox.value = index; // Set the checkbox value to the current index
        checkbox.onchange = function() { // Add onchange event handler
            const checkedBoxes = document.querySelectorAll('input[name="videoSelection"]:checked'); // Get all checked checkboxes
            // Create and insert related elements based on checkbox state
            if (this.checked) { // If the checkbox is checked
                createRelatedElementsContainer(this, index); // Create related elements
            } else { // If the checkbox is unchecked
                removeRelatedElementsContainer(this, index); // Remove related elements
            }

            // Ensure dropdowns appear dynamically based on checked checkboxes
            showOrderDropdowns(); // Call function to show dropdowns

            if (checkedBoxes.length > 2) { // If more than 2 checkboxes are checked
                this.checked = false; // Uncheck the current checkbox
                showToast00005('You can select up to 2 videos only.'); // Show toast message
            }
        };

        const label = document.createElement('label'); // Create a label element
        label.textContent = `Video Preview ${index + 1}`; // Set the label text

        const checkboxLabel = document.createElement('span'); // Create a span for the checkbox label
        checkboxLabel.textContent = 'Submit This Vid?'; // Set the checkbox label text

        checkboxContainer.appendChild(checkboxLabel); // Append the checkbox label to the container
        checkboxContainer.appendChild(checkbox); // Append the checkbox to the container
        previewContainer.appendChild(label); // Append the label to the preview container
        previewContainer.appendChild(checkboxContainer); // Append the checkbox container to the preview container
        previewContainer.appendChild(videoElement); // Append the video element to the preview container
    });

    // Hide the image and update the container min-height when showing video previews
    document.getElementById('BannerAtBottomOfPage').style.display = 'none';
    document.querySelector('.containerForTopLeftSection').style.minHeight = '950px'; // <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 6 of 11  <<< 
}














































// ********Video**************Part 23






// Function to create related elements container based on checkbox state
function createRelatedElementsContainer(checkbox, index) {
    const parentContainer = checkbox.parentNode; // Get the parent container of the checkbox

    // Remove any existing related elements container
    removeRelatedElementsContainer(checkbox, index); // Call function to remove existing related elements container

    const relatedElementsContainer = document.createElement('div'); // Create a new div for the related elements container
    relatedElementsContainer.classList.add('relatedElementsContainer'); // Add class for identification

    // Create dropdown menu
    const dropdown = document.createElement('select'); // Create a dropdown select element
    dropdown.name = 'videoOrder'; // Set the name attribute for the dropdown
    dropdown.style.marginLeft = '10px'; // Add some spacing between checkbox and dropdown

    const dropdownLabel = document.createElement('span'); // Create a span for the dropdown label
    dropdownLabel.textContent = 'Order of Play:'; // Set the text content for the dropdown label
    
    const dropdownContainer = document.createElement('div'); // Create a div for the dropdown container
    dropdownContainer.classList.add('dropdownContainer'); // Add class for identification
    dropdownContainer.appendChild(dropdownLabel); // Append the dropdown label to the container
    dropdownContainer.appendChild(dropdown); // Append the dropdown to the container

    relatedElementsContainer.appendChild(dropdownContainer); // Append the dropdown container to the related elements container

    const wrapperDiv = document.createElement('div'); // Create a wrapper div
    wrapperDiv.style.marginTop = index === 1 ? '-150px' : '-300px'; // Apply margin based on index (this is talking about: the left number is (video preview 2) for where 'secondary title/description/logo' options (for users to fill in) SHOWS UP, IN COMPARISON TO (the 'right' number, being, video preview 1's:) 'secondary title/description/logo'. so the right number is higher, to make first video preview's numbers be higher on the webpage. while second is second higher, to make it appear second higher on the page. its negative, to help force it to move upward i guess. idk but it works -8:25pm on 2/4/25 )

    const radioButtonContainer = document.createElement('div'); // Create a div for the radio buttons container
    radioButtonContainer.style.display = 'flex'; // Use flexbox for layout
    radioButtonContainer.style.flexDirection = 'column'; // Stack items vertically
    radioButtonContainer.style.alignItems = 'flex-end'; // Align items to the end (right)
    
    const addSecondaryTitleRadio = document.createElement('input'); // Create a radio button for adding a secondary title
    addSecondaryTitleRadio.type = 'radio'; // Set input type to radio
    addSecondaryTitleRadio.name = `secondaryOptions${index}`; // Set the name attribute for the radio button
    addSecondaryTitleRadio.value = 'addSecondaryTitle'; // Set the value attribute for the radio button

    const addSecondaryTitleLabel = document.createElement('label'); // Create a label for the secondary title radio button
    addSecondaryTitleLabel.textContent = "Add 'Secondary' Title?"; // Set the text content for the label
    addSecondaryTitleLabel.style.marginRight = '10px'; // Add some spacing to the right of the label
    addSecondaryTitleLabel.style.textAlign = 'right'; // Right-align the label
    addSecondaryTitleLabel.appendChild(addSecondaryTitleRadio); // Append the radio button to the label

    const addSecondaryDescriptionRadio = document.createElement('input'); // Create a radio button for adding a secondary description
    addSecondaryDescriptionRadio.type = 'radio'; // Set input type to radio
    addSecondaryDescriptionRadio.name = `secondaryOptions${index}`; // Set the name attribute for the radio button
    addSecondaryDescriptionRadio.value = 'addSecondaryDescription'; // Set the value attribute for the radio button

    const addSecondaryDescriptionLabel = document.createElement('label'); // Create a label for the secondary description radio button
    addSecondaryDescriptionLabel.textContent = "Add 'Secondary' Description?"; // Set the text content for the label
    addSecondaryDescriptionLabel.style.marginRight = '10px'; // Add some spacing to the right of the label
    addSecondaryDescriptionLabel.style.textAlign = 'right'; // Right-align the label
    addSecondaryDescriptionLabel.appendChild(addSecondaryDescriptionRadio); // Append the radio button to the label

    const addSecondaryLogoRadio = document.createElement('input'); // Create a radio button for adding a secondary logo
    addSecondaryLogoRadio.type = 'radio'; // Set input type to radio
    addSecondaryLogoRadio.name = `secondaryOptions${index}`; // Set the name attribute for the radio button
    addSecondaryLogoRadio.value = 'addSecondaryLogo'; // Set the value attribute for the radio button

    const addSecondaryLogoLabel = document.createElement('label'); // Create a label for the secondary logo radio button
    addSecondaryLogoLabel.textContent = "Add 'Secondary' Logo?"; // Set the text content for the label
    addSecondaryLogoLabel.style.marginRight = '10px'; // Add some spacing to the right of the label
    addSecondaryLogoLabel.style.textAlign = 'right'; // Right-align the label
    addSecondaryLogoLabel.appendChild(addSecondaryLogoRadio); // Append the radio button to the label

    // Add save button
    const saveButton = document.createElement('button'); // Create a button element for saving
    saveButton.textContent = 'Save? (Coming Soon)'; // Set the text content for the save button
    saveButton.id = `SaveCheckBox${index + 1}`; // Set the ID attribute for the save button
    saveButton.disabled = true; // Initially disable the save button

    // Append radio buttons and save button to the radio button container
    radioButtonContainer.appendChild(addSecondaryTitleLabel); // Append the secondary title label
    radioButtonContainer.appendChild(addSecondaryDescriptionLabel); // Append the secondary description label
    radioButtonContainer.appendChild(addSecondaryLogoLabel); // Append the secondary logo label
    radioButtonContainer.appendChild(saveButton); // Append the save button

    wrapperDiv.appendChild(radioButtonContainer); // Append the radioButtonContainer to the wrapper div
    relatedElementsContainer.appendChild(wrapperDiv); // Append the wrapper div to the related elements container
    parentContainer.appendChild(relatedElementsContainer); // Append the related elements container to the parent container

    // Event listeners for radio buttons
    addSecondaryTitleRadio.addEventListener('change', () => showSecondaryInput('title', addSecondaryTitleLabel)); // Add change event listener for secondary title radio button
    addSecondaryDescriptionRadio.addEventListener('change', () => showSecondaryInput('description', addSecondaryDescriptionLabel)); // Add change event listener for secondary description radio button
    addSecondaryLogoRadio.addEventListener('change', () => showSecondaryInput('logo', addSecondaryLogoLabel)); // Add change event listener for secondary logo radio button
}














































// ********Video**************Part 24






// Function to remove related elements container based on checkbox state
function removeRelatedElementsContainer(checkbox, index) {
    const parentContainer = checkbox.parentNode; // Get the parent container of the checkbox
    const relatedElementsContainer = parentContainer.querySelector('.relatedElementsContainer'); // Get the related elements container within the parent container
    
    if (relatedElementsContainer) { // Check if the related elements container exists
        relatedElementsContainer.remove(); // Remove the related elements container
    }
}








































// ********Video**************Part 25




// Function to show order dropdowns based on checked checkboxes
function showOrderDropdowns() {
    const checkboxes = document.querySelectorAll('input[name="videoSelection"]:checked'); // Get all checked video selection checkboxes
    checkboxes.forEach((checkbox, orderIndex) => { // Loop through each checked checkbox
        const dropdown = checkbox.parentNode.querySelector('select[name="videoOrder"]'); // Get the dropdown menu related to the checkbox
        if (dropdown) {
            dropdown.innerHTML = ''; // Clear existing options
            for (let j = 1; j <= checkboxes.length; j++) { // Create options based on the number of checked checkboxes
                const option = document.createElement('option'); // Create an option element
                option.value = j; // Set the value of the option
                option.text = `${j}`; // Set the text of the option
                dropdown.appendChild(option); // Append the option to the dropdown
            }
            dropdown.value = orderIndex + 1; // Set default order based on selection order
        }
    });
}
























// ********Video**************Part 26






function showSecondaryInput(type, element) {
    const container = element.parentNode; // Get the parent container of the element

    // Check if the secondary input already exists
    const existingInput = container.querySelector(`.secondaryInput-${type}`); // Query for existing secondary input of the same type
    if (existingInput) {
        existingInput.remove(); // Remove the existing secondary input if it exists
    } else {
        const secondaryInput = document.createElement('div'); // Create a new div for the secondary input
        secondaryInput.classList.add(`secondaryInput-${type}`); // Add a class based on the type
        secondaryInput.style.display = 'flex'; // Use flexbox for layout
        secondaryInput.style.alignItems = 'center'; // Center items vertically
        secondaryInput.style.marginLeft = '10px'; // Add some spacing

        if (type === 'title') {
            const inputBox = document.createElement('input'); // Create an input box for the secondary title
            inputBox.type = 'text'; // Set input type to text
            inputBox.placeholder = 'Coming Soon- Video, like: Enter Secondary Title'; // Set placeholder text
            secondaryInput.appendChild(inputBox); // Append the input box to the secondary input container
        } else if (type === 'description') {
            const descriptionBox = document.createElement('textarea'); // Create a textarea for the secondary description
            descriptionBox.placeholder = 'Coming Soon- Video, like: Enter Secondary Description'; // Set placeholder text
            descriptionBox.maxLength = 1000; // Set maximum length
            secondaryInput.appendChild(descriptionBox); // Append the textarea to the secondary input container
        } else if (type === 'logo') {
            const fileInput = document.createElement('input'); // Create a file input for the secondary logo
            fileInput.type = 'file'; // Set input type to file
            const cancelButton = document.createElement('button'); // Create a cancel button
            cancelButton.textContent = 'Cancel'; // Set the text content of the cancel button
            secondaryInput.appendChild(fileInput); // Append the file input to the secondary input container
            secondaryInput.appendChild(cancelButton); // Append the cancel button to the secondary input container

            cancelButton.addEventListener('click', () => {
                fileInput.value = ''; // Clear the file input when cancel button is clicked
            });
        }
        element.parentNode.insertBefore(secondaryInput, element.nextSibling); // Insert the secondary input after the element
    }
}


































// ********Video**************Part 27 ***Updated with sanitation features (video submit form) from sql injections i believe -6:41pm on 2/5/25


// Sanitize function for video inputs
function sanitizeVideoInput(input) {
    const div = document.createElement('div'); // Create a new HTML <div> element
    div.appendChild(document.createTextNode(input)); // Insert the user's input as plain text inside the <div>
    return div.innerHTML; // Return the sanitized version of the input
}

// Add an event listener to the submit button for the video form
document.getElementById('submitVideo').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default form submission

    document.querySelector('.containerForTopLeftSection').style.minHeight = '650px'; //Note < This part <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 7 of 11  <<< and this part modifies the height of the header, there's atleast two places. each of the places, i will try to mark down as location:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 8 of 11 <<<<<<
    document.getElementById('BannerAtBottomOfPage').style.display = 'block';

    // Populate hidden fields with secondary inputs before submitting the form
    const container = document.getElementById('previewContainer'); // Get the preview container
    const checkboxOne = container.querySelector('input[name="videoSelection"][value="0"]'); // Get the first checkbox
    const checkboxTwo = container.querySelector('input[name="videoSelection"][value="1"]'); // Get the second checkbox

    if (checkboxOne && checkboxOne.checked) { // Check if the first checkbox is checked
        const secondaryTitleInput = checkboxOne.parentNode.querySelector('input[type="text"]'); // Get the secondary title input
        const secondaryDescriptionInput = checkboxOne.parentNode.querySelector('textarea'); // Get the secondary description input
        const secondaryLogoInput = checkboxOne.parentNode.querySelector('input[type="file"]'); // Get the secondary logo input

        document.getElementById('secondaryTitle1').value = secondaryTitleInput ? sanitizeVideoInput(secondaryTitleInput.value) : ''; // Set and sanitize the value of the secondary title
        document.getElementById('secondaryDescription1').value = secondaryDescriptionInput ? sanitizeVideoInput(secondaryDescriptionInput.value) : ''; // Set and sanitize the value of the secondary description
        if (secondaryLogoInput && secondaryLogoInput.files[0]) { // Check if the secondary logo input has a file
            document.getElementById('secondaryLogo1').files = secondaryLogoInput.files; // Set the files of the secondary logo
        }
    }

    if (checkboxTwo && checkboxTwo.checked) { // Check if the second checkbox is checked
        const secondaryTitleInput = checkboxTwo.parentNode.querySelector('input[type="text"]'); // Get the secondary title input
        const secondaryDescriptionInput = checkboxTwo.parentNode.querySelector('textarea'); // Get the secondary description input
        const secondaryLogoInput = checkboxTwo.parentNode.querySelector('input[type="file"]'); // Get the secondary logo input

        document.getElementById('secondaryTitle2').value = secondaryTitleInput ? sanitizeVideoInput(secondaryTitleInput.value) : ''; // Set and sanitize the value of the secondary title
        document.getElementById('secondaryDescription2').value = secondaryDescriptionInput ? sanitizeVideoInput(secondaryDescriptionInput.value) : ''; // Set and sanitize the value of the secondary description
        if (secondaryLogoInput && secondaryLogoInput.files[0]) { // Check if the secondary logo input has a file
            document.getElementById('secondaryLogo2').files = secondaryLogoInput.files; // Set the files of the secondary logo
        }
    }

    // Sanitize video form inputs
    const videoTitle = sanitizeVideoInput(document.getElementById('videoTitle').value);
    const videoDescription = sanitizeVideoInput(document.getElementById('videoDescription').value);
    const scheduleTime = document.getElementById('scheduleTime').value;

    // Submit the form
    const form = document.getElementById('videoForm'); // Get the form element
    const formData = new FormData(form); // Create a FormData object with the form data

    // Append sanitized inputs to the form data
    formData.set('videoTitle', videoTitle);
    formData.set('videoDescription', videoDescription);
    formData.set('scheduleTime', scheduleTime);

    fetch('includes/videosubmit.php', { // Submit the form data to the server
        method: 'POST', // Use the POST method
        body: formData // Set the request body to the FormData object
    })
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        if (data.status === 'success') { // Check if the submission was successful
            showToast00006('Video submitted successfully'); // Display toast notification for successful submission
            clearFormFieldsAndPreview(); // Clear the form fields and preview
            clearFormFieldsAndButtons(); // Clear the form fields and buttons
            stopGif(); // Stop the GIF animation
        } else {
            showToast('05Failed to submit video'); // Display toast notification if submission fails
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log any errors that occur during submission
        showToast('06Failed to submit video'); // Display toast notification if there's an error
    });
});

function showToast(message) {
    const toast = document.createElement('div'); // Create a new div element for the toast
    toast.className = 'toast'; // Add the toast class for styling
    toast.textContent = message; // Set the text content of the toast
    document.body.appendChild(toast); // Append the toast to the body of the document

    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}





























// ********Video**************Part 28






function updateVideoStatus(videoId) {
    // Placeholder implementation for updating video status
    console.log(`Updating video status for video ID: ${videoId}`); // Log the video ID for which the status is being updated
    
    // Make an AJAX call to update the video_played field in the database
    fetch('includes/updateVideoStatus.php', { // Send a POST request to updateVideoStatus.php
        method: 'POST', // Use the POST method
        headers: {
            'Content-Type': 'application/json' // Set the content type to JSON
        },
        body: JSON.stringify({ id: videoId }) // Send the video ID as a JSON string in the request body
    }).then(response => response.json()) // Parse the response as JSON
    .then(data => {
        console.log('Video status updated:', data); // Log the response data
    }).catch(error => {
        console.error('Error updating video status:', error); // Log any errors that occur during the request
    });
}


































// ********Video**************Part 29








// Event listener to show logo image preview when a file is selected
document.getElementById('logoFile').addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        const reader = new FileReader(); // Create a FileReader to read the file
        reader.onload = function(e) { // When the file is read
            const logoPreview = document.getElementById('logoPreview'); // Get the logo preview element
            if (!logoPreview) { // If the logo preview element doesn't exist
                const img = document.createElement('img'); // Create a new img element
                img.id = 'logoPreview'; // Set the ID for the img element
                img.src = e.target.result; // Set the src to the file data
                img.style.maxWidth = '150px'; // Set max width
                img.style.maxHeight = '150px'; // Set max height
                document.querySelector('label[for="logoFile"]').appendChild(img); // Append the img to the label
            } else {
                logoPreview.src = e.target.result; // If the logo preview element exists, update the src
            }
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    }
});


























// ********Video**************Part 30





// Function to clear and hide the logo image preview
function clearLogoPreview() {
    const logoPreview = document.getElementById('logoPreview'); // Get the logo preview element
    if (logoPreview) { // If the logo preview element exists
        logoPreview.remove(); // Remove the logo preview element
    }
}














// ********Video**************Part 31






// Ensure logo preview clears when video is submitted
document.getElementById('submitVideo').addEventListener('click', clearLogoPreview); // Add click event listener to the submit video button to clear the logo preview





























// ********Video**************Part 32





// Add the additional functions for calendar and recently played sections

function addVideoToCalendar(videoId, videoTitle, videoDescription, videoLogo, playTime) {
    const scheduleContainer = document.getElementById('scheduleContainer'); // Get the schedule container element
    const eventDate = new Date(playTime).toDateString(); // Convert the play time to a date string
    let dateSlot = Array.from(scheduleContainer.children).find(child => child.dataset.date === eventDate); // Find the date slot for the event date
    if (!dateSlot) { // If the date slot doesn't exist
        dateSlot = document.createElement('div'); // Create a new div for the date slot
        dateSlot.dataset.date = eventDate; // Set the data-date attribute to the event date
        dateSlot.classList.add(playTime <= Date.now() ? "past-day" : "future-day"); // Add the appropriate class based on whether the play time is in the past or future
        dateSlot.textContent = eventDate; // Set the text content to the event date
        scheduleContainer.appendChild(dateSlot); // Append the date slot to the schedule container
    }

    const newEvent = document.createElement('div'); // Create a new div for the event
    newEvent.style.color = "white"; // Set the text color to white
    newEvent.innerHTML = `
        <div>${new Date(playTime).toLocaleTimeString()} 
        <span style="font-weight:bold; background: linear-gradient(10deg, #f7ec9c, #ff8651);-webkit-background-clip: text; color: transparent;">${videoTitle ? `${videoTitle}` : ""}</span>
        ${videoDescription ? `${videoDescription}` : ""}
        ${videoLogo ? `<p id="logo-${videoId}"><img src="../uploads/${videoLogo}" alt="Loading..." style="max-width: 100px; max-height: 100px; object-fit: contain; vertical-align: middle;"></p>` : ""}
    </div>
    `; // Set the inner HTML for the event, including the play time, title, description, and logo if available
    dateSlot.appendChild(newEvent); // Append the new event to the date slot
    
    // Add loading spinner if the logo file exists
    if (videoLogo) { // If a logo file is provided
        const logoContainer = document.getElementById(`logo-${videoId}`); // Get the logo container element
        if (logoContainer) { // If the logo container element exists
            logoContainer.innerHTML = '<div class="spinner"></div>'; // Add a loading spinner to the logo container
            checkAndUpdateLogo(videoId, videoLogo); // Call the function to check and update the logo
        }
    }
}


































// ********VideoBACKUP**************Part 0






// *************************************** ALL THE CONTENT BELOW HERE IS FOR THE "just in case a video does NOT play at its scheduled time? this code will look for all audios(video_played) column in mysql, find what didnt play, and play it.  ***Update:> This is now part of " Quest ZZZZZZ Part 6Zs" =D! -9:15pm on 12/20/24

let videoSchedule002 = []; // Initialize empty videoSchedule002 array
let isPlaying = false; // Flag to check if a video is currently playing
let isRecordingVideo = false; // Flag to check if a user is recording a video
let isRecordingAudio = false; // Flag to check if a user is recording an audio







// ********VideoBACKUP**************Part 1






async function fetchUpcomingVideos() {
    try {
        const response = await fetch('includes/getUpcomingVideos.php'); // Fetch upcoming videos from the server
        if (!response.ok) { // Check if the network response is not ok
            console.error('Network response was not ok:', response.statusText); // Log an error message
            return []; // Return an empty array
        }
        const data = await response.json(); // Parse the response as JSON
        console.log('Fetched videos from server:', data); // Log the fetched data
        return data; // Return the fetched data
    } catch (error) {
        console.error('Error fetching upcoming videos:', error); // Log any errors that occur during fetching
        return []; // Return an empty array in case of error
    }
}























// ********VideoBACKUP**************Part 2






function initializeVideoSchedule() {
    console.log('Initializing videoSchedule002...'); // Log the initialization process
    fetchUpcomingVideos().then(fetchedVideos => { // Fetch upcoming videos and handle the response
        console.log('Fetched videos:', fetchedVideos); // Log the fetched videos
        videoSchedule002 = fetchedVideos; // Direct assignment of fetched videos to videoSchedule002
        console.log('Initialized videoSchedule002:', videoSchedule002); // Log the initialized video schedule
    }).catch(error => {
        console.error('Error initializing videoSchedule002:', error); // Log any errors that occur during initialization
    });
}


















// ********VideoBACKUP**************Part 3






function updateComingUpNext() {
    console.log('Updating Coming Up Next section...'); // Log the update process
    const now = new Date().getTime(); // Get the current time in milliseconds
    const upcomingEntries = videoSchedule002
        .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()) // Sort the video schedule by scheduled time
        .slice(0, 3); // Limit the upcoming entries to the top 3

    const comingUpNextContainer = document.getElementById('comingUpNextEntries'); // Get the container for upcoming entries
    const comingUpNextHeader = document.getElementById('comingUpNextHeader'); // Get the header for upcoming entries
    comingUpNextContainer.innerHTML = ''; // Clear previous content

    if (upcomingEntries.length === 0) { // Check if there are no upcoming entries
        console.log('No upcoming entries found.'); // Log the absence of upcoming entries
        comingUpNextHeader.style.display = 'none'; // Hide the header if no upcoming tracks
    } else {
        console.log('Upcoming entries found:', upcomingEntries); // Log the upcoming entries
        comingUpNextHeader.style.display = 'block'; // Show the header if there are upcoming tracks
        upcomingEntries.forEach(entry => { // Loop through each upcoming entry
            const entryElement = document.createElement('div'); // Create a new div for each entry
            entryElement.innerHTML = `
                <p>${new Date(entry.scheduledTime).toLocaleString()} - ${entry.title || ''}</p>
                ${entry.description ? `<p>${entry.description}</p>` : ""}
            `; // Set the inner HTML of the entry element
            comingUpNextContainer.appendChild(entryElement); // Append the entry element to the coming up next container
        });
    }
}













// ********VideoBACKUP**************Part 4







function updateVideoPlayed(videoId) {
    const xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object
    xhr.open("POST", "includes/updateVideoPlayed.php", true); // Open a POST request to updateVideoPlayed.php
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // Set the request header to handle URL-encoded form data
    xhr.onreadystatechange = function () { // Define a function to handle the state change of the request
        if (xhr.readyState === 4 && xhr.status === 200) { // Check if the request is complete and successful
            console.log("Video played count updated successfully."); // Log success message
            console.log(xhr.responseText); // Log the response from the server
        } else if (xhr.readyState === 4) { // Check if the request is complete but not successful
            console.error("Error updating video played count."); // Log error message
            console.error(xhr.responseText); // Log the response from the server
        }
    };
    xhr.send("videoId=" + videoId); // Send the request with the video ID as a parameter
}





























// ********VideoBACKUP**************Part 5 (I believe this is the one that shows up to play. its either this one or: "// ********Video**************Part 8")





function playScheduledVideos() {
    const videoPlayerContainer = document.getElementById('headerRightContainer002'); // Get the video player container element
    if (!isPlaying && videoSchedule002.length > 0 && !isRecordingVideo && !isRecordingAudio && !videoPlayerContainer.querySelector('video')) {
        // Check if no video is currently playing, there are scheduled videos, not recording video or audio, and no video element in the container
        const nextVideo = videoSchedule002[0]; // Take the first video to play from the schedule
        console.log('Playing video:', nextVideo); // Log the video that will be played
        isPlaying = true; // Set the isPlaying flag to true

        videoPlayerContainer.innerHTML = ''; // Clear existing content in the video player container

        // Create primaryContainer
        const primaryContainer = document.createElement('div'); // Create a new div element for the primary container
        primaryContainer.id = 'primaryContainer'; // Set the ID for the primary container
        primaryContainer.style.display = 'flex'; // Use flexbox for layout
        primaryContainer.style.flexDirection = 'row'; // Arrange items in a row
        primaryContainer.style.maxWidth = '600px'; // Set the maximum width of the primary container
        primaryContainer.style.margin = '0 auto'; // Center the primary container
        primaryContainer.style.justifyContent = 'space-between'; // Ensure even spacing between items
        primaryContainer.style.transform = 'scale(0.99) translate(-5px, -175px)'; // *********************** SPECIAL NOTE:> ZZZ001:> PART 3 of 4:>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHANGE THIS (the two numbers in paranathases are X axis and Y axis) TO CHANGE WHERE THE PRIMARY CONTAINER & SECONDARY CONTAINER (and its size) SHOULD BE LOCATED (the ones that appear ABOVE and BELOW the SCHEDULED LIVE/PLAYING VIDEO! -12:13am on 2/25/25)
        primaryContainer.style.transformOrigin = 'top left'; // Ensure scaling happens from the top-left corner


        // Create and style primaryContainerLeft
        const primaryContainerLeft = document.createElement('div'); // Create a new div element for the left container
        primaryContainerLeft.id = 'primaryContainerLeft'; // Set the ID for the left container
        primaryContainerLeft.style.display = 'flex'; // Use flexbox for layout
        primaryContainerLeft.style.justifyContent = 'flex-start'; // Align items to the left
        primaryContainerLeft.style.alignItems = 'flex-start'; // Align items to the top
        primaryContainerLeft.style.flex = '0 0 150px'; // Fixed width for the left container

        // Display main title, description, and logo above the video
        if (nextVideo.video_logo_url) { // Check if the video has a logo URL
            const logoElement = document.createElement('img'); // Create an img element for the logo
            logoElement.src = `uploads/${nextVideo.video_logo_url}`; // Set the source of the logo image
            logoElement.style.maxWidth = '150px'; // Adjust size as needed
            logoElement.style.maxHeight = '150px'; // Adjust size as needed
            primaryContainerLeft.appendChild(logoElement); // Append the logo element to the left container
        }


        // Create and style primaryContainerCenter
        const primaryContainerCenter = document.createElement('div'); // Create a new div element for the center container
        primaryContainerCenter.id = 'primaryContainerCenter'; // Set the ID for the center container
        primaryContainerCenter.style.display = 'flex'; // Use flexbox for layout
        primaryContainerCenter.style.flexDirection = 'column'; // Arrange items in a column
        primaryContainerCenter.style.alignItems = 'center'; // Center items horizontally
        primaryContainerCenter.style.flex = '1'; // Take up the remaining space
        primaryContainerCenter.style.maxWidth = '300px'; // Set the maximum width for the center container

        // Container for title and vote buttons
        const titleVoteContainer = document.createElement('div'); // Create a new div for the title and vote buttons container
        titleVoteContainer.style.display = 'flex'; // Use flexbox for layout
        titleVoteContainer.style.flexDirection = 'row'; // Arrange items in a row
        titleVoteContainer.style.alignItems = 'center'; // Center items vertically

        const titleContainer = document.createElement('div'); // Create a new div for the title container
        titleContainer.style.textAlign = 'center'; // Center the title within its container
        titleContainer.style.flex = '1'; // Allow the title to take up the remaining space

        if (nextVideo.video_title) { // Check if the video has a title
            const titleElement = document.createElement('h2'); // Create an h2 element for the title
            titleElement.textContent = nextVideo.video_title; // Set the text content of the title
            titleContainer.appendChild(titleElement); // Append the title element to the title container
        }
        titleVoteContainer.appendChild(titleContainer); // Append the title container to the title and vote buttons container

        // Function to add upvote and downvote buttons
        function addUpvoteDownvoteButtons(titleVoteContainer, videoId) {
            console.log('Adding upvote and downvote buttons for video ID:', videoId); // Log the video ID for which the buttons are being added

            const upvoteButton = document.createElement('button'); // Create a button element for upvote
            upvoteButton.innerHTML = '⬆️'; // Set the upvote arrow symbol
            upvoteButton.onclick = function () { // Add an onclick event handler
                updateVote(videoId, 'upvote'); // Call the updateVote function with 'upvote'
            };

            const downvoteButton = document.createElement('button'); // Create a button element for downvote
            downvoteButton.innerHTML = '⬇️'; // Set the downvote arrow symbol
            downvoteButton.onclick = function () { // Add an onclick event handler
                updateVote(videoId, 'downvote'); // Call the updateVote function with 'downvote'
            };

            const voteContainer = document.createElement('div'); // Create a div element for the vote container
            voteContainer.style.display = 'flex'; // Use flexbox for layout
            voteContainer.style.flexDirection = 'column'; // Stack buttons vertically
            voteContainer.style.marginRight = '10px'; // Add margin to the right of the buttons
            voteContainer.appendChild(upvoteButton); // Append the upvote button to the vote container
            voteContainer.appendChild(downvoteButton); // Append the downvote button to the vote container

            // Adding the voteContainer to the left of the title
            titleVoteContainer.insertBefore(voteContainer, titleContainer); // Insert the vote container before the title container
        }

        // Add upvote and downvote buttons
        addUpvoteDownvoteButtons(titleVoteContainer, nextVideo.id); // Call the function to add upvote and downvote buttons
        primaryContainerCenter.appendChild(titleVoteContainer); // Append the title and vote buttons container to the center container

        if (nextVideo.video_description) { // Check if the video has a description
            const descriptionElement = document.createElement('p'); // Create a p element for the description
            descriptionElement.textContent = nextVideo.video_description; // Set the text content of the description
            primaryContainerCenter.appendChild(descriptionElement); // Append the description element to the center container
        }


        // Create and style primaryContainerRight
        const primaryContainerRight = document.createElement('div'); // Create a new div element for the right container
        primaryContainerRight.id = 'primaryContainerRight'; // Set the ID for the right container
        primaryContainerRight.style.display = 'flex'; // Use flexbox for layout
        primaryContainerRight.style.justifyContent = 'flex-end'; // Align items to the right
        primaryContainerRight.style.alignItems = 'flex-start'; // Align items to the top
        primaryContainerRight.style.flex = '0 0 150px'; // Fixed width for the right container

        if (nextVideo.video_logo_url) { // Check if the video has a logo URL
            const logoElementRight = document.createElement('img'); // Create an img element for the logo
            logoElementRight.src = `uploads/${nextVideo.video_logo_url}`; // Set the source of the logo image
            logoElementRight.style.maxWidth = '150px'; // Adjust size as needed
            logoElementRight.style.maxHeight = '150px'; // Adjust size as needed
            primaryContainerRight.appendChild(logoElementRight); // Append the logo element to the right container
        }

        // Append subcontainers to primaryContainer
        primaryContainer.appendChild(primaryContainerLeft); // Append the left container to the primary container
        primaryContainer.appendChild(primaryContainerCenter); // Append the center container to the primary container
        primaryContainer.appendChild(primaryContainerRight); // Append the right container to the primary container

        // Append primaryContainer to videoPlayerContainer
        videoPlayerContainer.appendChild(primaryContainer); // Append the primary container to the video player container

const videoElement = document.createElement('video'); // Create a video element
videoElement.controls = true; // Enable video controls
videoElement.style.width = '100%'; // Make the video fit the container
videoElement.style.maxWidth = '300px'; // Set a maximum width of 300px to help control size of video
videoElement.src = `uploads/${nextVideo.video_url}`; // Set the source of the video to the uploaded file
videoElement.style.transform = 'translate(25px, -175px)'; // *************************SPECIAL NOTE YYY001 PART 2 of 2:>>>>>>>>>>>>>>>>>>>>>>>  CHANGE BOTH THIS ENTRY, AND THE OTHER PART (part 1 of 2 AND part 2 of 2) TO CHANGE SIZE AND LOCATION OF WHERE THE VIDEO SHOWS UP) -12:10am on -2/5/25

videoPlayerContainer.appendChild(videoElement); // Append the video element to the video player container
videoElement.play(); // Play the video

// Move the image to the left by 30px
const bannerImage = document.querySelector('.innerDivBelowPlacard');
bannerImage.style.left = '20px'; // Adjust the left position by -30px from 50%

// Change the min-height to 950px
const topLeftSection = document.querySelector('.containerForTopLeftSection');
topLeftSection.style.minHeight = '950px !important'; // Change the min-height to 950px <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 9 of 11  <<< 

videoElement.onended = () => { // Define an event handler for when the video ends
    console.log('Finished playing video:', nextVideo); // Log the video that finished playing
    nextVideo.video_played += 1; // Increment the video_played count locally
    isPlaying = false; // Set the isPlaying flag to false
    videoPlayerContainer.innerHTML = ''; // Clear the video player

    // Move the image back to its original position (right by 30px)
    const bannerImage = document.querySelector('.innerDivBelowPlacard');
    bannerImage.style.left = '50%'; // Reset the left position to 50%

    // Change the min-height back to 650px
    const topLeftSection = document.querySelector('.containerForTopLeftSection');
    topLeftSection.style.minHeight = '650px'; // Change the min-height back to 650px <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 10 of 11  <<< 


    // Update the audio_played count in the database
    updateVideoPlayed(nextVideo.id); // Call the function to update the video played count in the database

    // Remove the played video from the schedule
    videoSchedule002 = videoSchedule002.filter(entry => entry.id !== nextVideo.id); // Filter out the played video from the schedule
    console.log('Updated videoSchedule002 after playing video:', videoSchedule002); // Log the updated video schedule
    
    // Schedule the next video to play in 20 seconds
    setTimeout(playScheduledVideos, 20000); // Set a timeout to play the next scheduled video in 20 seconds
};

// Function to append secondary inputs
function appendSecondaryInputs(videoData) {
    const secondaryContainer = document.createElement('div'); // Create a new div for the secondary container
    secondaryContainer.id = 'secondaryContainer'; // Set the ID for the secondary container
    secondaryContainer.style.maxWidth = '600px'; // Set the maximum width of the secondary container
    secondaryContainer.style.margin = '0 auto'; // Center the secondary container
    secondaryContainer.style.display = 'flex'; // Use flexbox for layout
    secondaryContainer.style.flexDirection = 'column'; // Arrange items in a column
    secondaryContainer.style.transform = 'scale(0.99) translate(85px, -215px)'; // *********************** SPECIAL NOTE:> ZZZ001:> PART 4 of 4:>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHANGE THIS (the two numbers in paranathases are X axis and Y axis) TO CHANGE WHERE THE PRIMARY CONTAINER & SECONDARY CONTAINER (and its size) SHOULD BE LOCATED (the ones that appear ABOVE and BELOW the SCHEDULED LIVE/PLAYING VIDEO! -12:13am on 2/25/25)
    secondaryContainer.style.transformOrigin = 'top left'; // Ensure scaling happens from the top-left corner

    const secondaryContainerTop = document.createElement('div'); // Create a new div for the top part of the secondary container
    secondaryContainerTop.id = 'secondaryContainerTop'; // Set the ID for the top part
    secondaryContainerTop.style.flex = '0 0 90%'; // Set the flex properties
    secondaryContainerTop.style.display = 'flex'; // Use flexbox for layout
    secondaryContainerTop.style.flexDirection = 'row'; // Arrange items in a row

    const secondaryContainerLeft = document.createElement('div'); // Create a new div for the left part of the secondary container
    secondaryContainerLeft.id = 'secondaryContainerLeft'; // Set the ID for the left part
    secondaryContainerLeft.style.flex = '0 0 75%'; // Take up 75% of the width
    secondaryContainerLeft.style.display = 'flex'; // Use flexbox for layout
    secondaryContainerLeft.style.flexDirection = 'column'; // Arrange items in a column

    const secondaryContainerLeftTop = document.createElement('div'); // Create a new div for the top part of the left container
    secondaryContainerLeftTop.id = 'secondaryContainerLeftTop'; // Set the ID for the top part
    secondaryContainerLeftTop.style.flex = '0 0 15%'; // Take up 15% of the height

    const secondaryContainerLeftBottom = document.createElement('div'); // Create a new div for the bottom part of the left container
    secondaryContainerLeftBottom.id = 'secondaryContainerLeftBottom'; // Set the ID for the bottom part
    secondaryContainerLeftBottom.style.flex = '0 0 85%'; // Take up 85% of the height

    const secondaryContainerRight = document.createElement('div'); // Create a new div for the right part of the secondary container
    secondaryContainerRight.id = 'secondaryContainerRight'; // Set the ID for the right part
    secondaryContainerRight.style.flex = '0 0 25%'; // Take up 25% of the width
    secondaryContainerRight.style.display = 'flex'; // Use flexbox for layout
    secondaryContainerRight.style.flexDirection = 'column'; // Arrange items in a column

    const secondaryContainerRightTop = document.createElement('div'); // Create a new div for the top part of the right container
    secondaryContainerRightTop.id = 'secondaryContainerRightTop'; // Set the ID for the top part
    secondaryContainerRightTop.style.flex = '0 0 25%'; // Take up 25% of the height
    secondaryContainerRightTop.innerHTML = 'Coming Soon- Usernames'; // Placeholder text for the username field, and WAS PREVIOUSLY CALLED: URUsername but got changed to: "Coming Soon- Usernames" as of -3:36am on 2/1/25

    const secondaryContainerRightBottom = document.createElement('div'); // Create a new div for the bottom part of the right container
    secondaryContainerRightBottom.id = 'secondaryContainerRightBottom'; // Set the ID for the bottom part
    secondaryContainerRightBottom.style.flex = '0 0 75%'; // Take up 75% of the height
    secondaryContainerRightBottom.innerHTML = 'Coming Soon- Broadcasting Channels'; // Placeholder text for the broadcasting channel field, and WAS PREVIOUSLY CALLED: BroadCastingChannel00X but got changed to: "Coming Soon- Broadcasting Channels" as of -3:37am on 2/1/25

    const secondaryTitleField = ['checkbox_one_video_title', 'checkbox_two_video_title']; // Array for secondary title fields
    const secondaryDescriptionField = ['checkbox_one_video_description', 'checkbox_two_video_description']; // Array for secondary description fields
    const secondaryLogoField = ['checkbox_one_video_logo_url', 'checkbox_two_video_logo_url']; // Array for secondary logo fields


    secondaryTitleField.forEach((field, index) => {
        if (videoData[field]) { // Check if there is a value for the secondary title field
            const secondaryTitleElement = document.createElement('h3'); // Create an h3 element for the secondary title
            secondaryTitleElement.textContent = videoData[field]; // Set the text content of the secondary title
            secondaryContainerLeftTop.appendChild(secondaryTitleElement); // Append the secondary title element to the left top container
        }

        if (videoData[secondaryDescriptionField[index]]) { // Check if there is a value for the secondary description field
            const secondaryDescriptionElement = document.createElement('p'); // Create a p element for the secondary description
            secondaryDescriptionElement.textContent = videoData[secondaryDescriptionField[index]]; // Set the text content of the secondary description
            secondaryContainerLeftBottom.appendChild(secondaryDescriptionElement); // Append the secondary description element to the left bottom container
        }

        if (videoData[secondaryLogoField[index]]) { // Check if there is a value for the secondary logo field
            const secondaryLogoElement = document.createElement('img'); // Create an img element for the secondary logo
            secondaryLogoElement.src = `uploads/${videoData[secondaryLogoField[index]]}`; // Set the source of the secondary logo image
            secondaryLogoElement.style.maxWidth = '150px'; // Adjust size as needed
            secondaryLogoElement.style.maxHeight = '150px'; // Adjust size as needed
            primaryContainerRight.innerHTML = ''; // Clear any existing secondary logo content
            primaryContainerRight.appendChild(secondaryLogoElement); // Append the secondary logo element to the right container
        }
    });

    secondaryContainerLeft.appendChild(secondaryContainerLeftTop); // Append the left top container to the left container
    secondaryContainerLeft.appendChild(secondaryContainerLeftBottom); // Append the left bottom container to the left container

    secondaryContainerRight.appendChild(secondaryContainerRightTop); // Append the right top container to the right container
    secondaryContainerRight.appendChild(secondaryContainerRightBottom); // Append the right bottom container to the right container

    secondaryContainerTop.appendChild(secondaryContainerLeft); // Append the left container to the top container
    secondaryContainerTop.appendChild(secondaryContainerRight); // Append the right container to the top container

    secondaryContainer.appendChild(secondaryContainerTop); // Append the top container to the secondary container

    const secondaryContainerBottom = document.createElement('div'); // Create a new div for the bottom part of the secondary container
    secondaryContainerBottom.id = 'secondaryContainerBottom'; // Set the ID for the bottom part
    secondaryContainerBottom.style.display = 'flex'; // Use flexbox for layout
    secondaryContainerBottom.style.flexDirection = 'row'; // Arrange items in a row
    secondaryContainerBottom.style.flex = '0 0 10%'; // Take up 10% of the available space

    const secondaryContainerBottomLeft = document.createElement('div'); // Create a new div for the left part of the bottom container
    secondaryContainerBottomLeft.id = 'secondaryContainerBottomLeft'; // Set the ID for the left part
    secondaryContainerBottomLeft.style.flex = '0 0 90%'; // Take up 90% of the width
    secondaryContainerBottomLeft.style.display = 'flex'; // Use flexbox for layout
    secondaryContainerBottomLeft.style.justifyContent = 'center'; // Center the content
    secondaryContainerBottomLeft.style.alignItems = 'center'; // Center the content vertically
    secondaryContainerBottomLeft.innerHTML = 'Coming Soon- Tags'; // Placeholder text for the tagsforchannel field, and WAS PREVIOUSLY CALLED: TagsForChannel but got changed to: "Coming Soon- Tags" as of -3:39am on 2/1/25

    const secondaryContainerBottomRight = document.createElement('div'); // Create a new div for the right part of the bottom container
    secondaryContainerBottomRight.id = 'secondaryContainerBottomRight'; // Set the ID for the right part
    secondaryContainerBottomRight.style.flex = '0 0 10%'; // Take up 10% of the width
    secondaryContainerBottomRight.style.display = 'flex'; // Use flexbox for layout
    secondaryContainerBottomRight.style.justifyContent = 'center'; // Center the content horizontally
    secondaryContainerBottomRight.style.alignItems = 'center'; // Center the content vertically
    secondaryContainerBottomRight.innerHTML = `ID: ${videoData.id}`; // Set the text content to the video ID

    secondaryContainerBottom.appendChild(secondaryContainerBottomLeft); // Append the left part to the bottom container
    secondaryContainerBottom.appendChild(secondaryContainerBottomRight); // Append the right part to the bottom container

    secondaryContainer.appendChild(secondaryContainerBottom); // Append the bottom container to the secondary container

    videoPlayerContainer.appendChild(secondaryContainer); // Append the secondary container to the video player container
}

appendSecondaryInputs(nextVideo); // Call the function to append secondary inputs for the next video

} else {
console.log('No videos to play, a video is already playing, or recording is in progress.'); // Log a message if no videos to play or recording is in progress
// Schedule the next check in 20 seconds
setTimeout(playScheduledVideos, 20000); // Set a timeout to check for scheduled videos again in 20 seconds
}
}

























// ********VideoBACKUP**************Part 6





// Event listeners to handle recording video state
document.getElementById('recordButton02').addEventListener('click', function() {
    isRecordingVideo = !isRecordingVideo; // Toggle the recording video state
    console.log('Recording video state:', isRecordingVideo); // Log the current recording video state
    if (!isRecordingVideo) {
        // Resume video playback checks when recording stops
        setTimeout(playScheduledVideos, 20000); // Schedule the next video playback check in 20 seconds
    }
});










































// ********VideoBACKUP**************Part 7





// Event listeners to handle recording audio state
document.getElementById('recordButton').addEventListener('click', function() {
    isRecordingAudio = true; // Set the recording audio state to true
    console.log('Recording audio state:', isRecordingAudio); // Log the current recording audio state
});






















// ********VideoBACKUP**************Part 8





document.getElementById('submitMp3').addEventListener('click', function() {
    isRecordingAudio = false; // Set the recording audio state to false
    console.log('Recording audio state:', isRecordingAudio); // Log the current recording audio state
    // Resume video playback checks when audio recording stops
    setTimeout(playScheduledVideos, 20000); // Schedule the next video playback check in 20 seconds
});










// ********VideoBACKUP**************Part 9








// Initialize videoSchedule002 and start playback 20 seconds after page load
setTimeout(() => {
    initializeVideoSchedule(); // Initialize the video schedule
    setTimeout(playScheduledVideos, 20000); // Schedule the first video playback check in 20 seconds
}, 20000); // Start the initialization process 20 seconds after the page loads


// ***************************************** This area above, is for: "Video implementation" ******************************************************








// ********NotDOMed**************Part 33





//This is for creating a "zoom" feature, via clicking on an image.
// Create the modal and overlay elements
const modalOverlay = document.createElement('div'); // Create a new div element for the modal overlay
modalOverlay.className = 'modal-overlay'; // Set the class name for the modal overlay
const modalImg = document.createElement('img'); // Create a new img element for the modal image
modalImg.className = 'modal-img'; // Set the class name for the modal image
modalOverlay.appendChild(modalImg); // Append the modal image to the modal overlay
document.body.appendChild(modalOverlay); // Append the modal overlay to the document body






















// ********NotDOMed**************Part 34


// Function to handle image click and zoom for all images
function handleImageClickAndZoom() {
    document.addEventListener('click', function(event) { // Add a click event listener to the document
        if (event.target.tagName === 'IMG' && !event.target.classList.contains('exclude-zoom') && !modalOverlay.classList.contains('visible')) {
            // Check if the clicked element is an image, doesn't have the 'exclude-zoom' class, and the modal is not already visible
            const img = event.target; // Get the clicked image
            modalImg.src = img.src; // Set the source of the modal image to the clicked image's source
            modalImg.dataset.zoomLevel = 1; // Initialize the zoom level for the modal image

            modalImg.style.maxWidth = '600px'; // Set the maximum width of the modal image
            modalImg.style.maxHeight = '600px'; // Set the maximum height of the modal image
            modalOverlay.classList.add('visible'); // Add the 'visible' class to the modal overlay to display it
            console.log("Image clicked for zoom:", img.src); // Log the source of the clicked image
        } else if (modalOverlay.classList.contains('visible')) {
            // Hide the modal if any area, including the modal image, is clicked
            modalOverlay.classList.remove('visible'); // Remove the 'visible' class from the modal overlay to hide it
            console.log("Modal closed"); // Log that the modal has been closed
        }
    });
}


// ********NotDOMed**************Part 35

// Initialize the zoom functionality
handleImageClickAndZoom(); // Call the function to handle image click and zoom







// ********NotDOMed**************Part 36




// this script content below here is for the 20 billboard store *************************************** 

let currentIndex = 0; // Initialize the current index to 0
const placards = document.querySelectorAll('.placard'); // Select all elements with the class 'placard'
const placardContainer = document.querySelector('.placard-container'); // Select the element with the class 'placard-container'

// Function to rotate to a specific placard
function showPlacard(index) {
    placardContainer.style.transform = `rotateY(${-index * 18}deg)`; // Adjust rotation angle for 20 placards
    currentIndex = index; // Update the current index
}

// Function to show the next placard
function showNextPlacard() {
    showPlacard((currentIndex + 1) % placards.length); // Increment the index and wrap around using modulo
}

// Function to show the previous placard
function showPreviousPlacard() {
    showPlacard((currentIndex - 1 + placards.length) % placards.length); // Decrement the index and wrap around using modulo
}

// Automatic rotation every 3 seconds
let rotationInterval = setInterval(showNextPlacard, 9000); // Set an interval to show the next placard every 9 seconds

// Pause rotation on hover
placardContainer.addEventListener('mouseover', () => {
    clearInterval(rotationInterval); // Clear the interval to stop rotation when hovering
});

// Resume rotation when not hovering
placardContainer.addEventListener('mouseout', () => {
    rotationInterval = setInterval(showNextPlacard, 9000); // Reset the interval to resume rotation when not hovering
});

// Add event listeners for navigation arrows
document.querySelectorAll('.left-arrow').forEach(arrow => {
    arrow.addEventListener('click', showPreviousPlacard); // Add click event listener to show the previous placard
});
document.querySelectorAll('.right-arrow').forEach(arrow => {
    arrow.addEventListener('click', showNextPlacard); // Add click event listener to show the next placard
});

// this script content above here is for the 20 billboard store ***************************************


// this script content below is for the 20 billboard store when it comes to their images and up and down arrows:


// this stuff is for Placard 001: *****************************************

    var imagesForPlacard001 = [
    '/StoreProductsAndImagery/UminionLogo001.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo001.00.2024Classic.png'
];
var textsForPlacard001 = [
    'Sister Union #1 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic',
    'Sister Union #1 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic'
];
var buttonIdsForPlacard001 = [
    'UStoreButton005.013.02A', //< Button id for Sister Union 2025 #1
    'UStoreButton005.013.01A'  //< Button id for Sister Union 2024 #1
];
var buttonSkusForPlacard001 = [
    'UStoreButton005.013.02A', //< SKU for Sister Union 2025 #1
    'UStoreButton005.013.01A'  //< SKU for Sister Union 2024 #1
];

var currentIndexForPlacard001 = 0;

function changeImageForPlacard001(direction) {
    // Change the index based on direction
    if (direction === 'up') {
        currentIndexForPlacard001 = (currentIndexForPlacard001 + 1) % imagesForPlacard001.length;
    } else if (direction === 'down') {
        currentIndexForPlacard001 = (currentIndexForPlacard001 - 1 + imagesForPlacard001.length) % imagesForPlacard001.length;
    }

    // Update image
    document.getElementById('placard001').style.backgroundImage = "url('" + imagesForPlacard001[currentIndexForPlacard001] + "')";

    // Update text
    document.getElementById('textContainer001').innerHTML = textsForPlacard001[currentIndexForPlacard001];

    // Update button id and data-sku
    const button = document.querySelector('#placard001 button');
    button.id = buttonIdsForPlacard001[currentIndexForPlacard001];
    button.setAttribute('data-sku', buttonSkusForPlacard001[currentIndexForPlacard001]);
}



// this stuff is for Placard 002: *****************************************

var imagesForPlacard002 = [
    '/StoreProductsAndImagery/UminionLogo002.02.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo002.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo002.03.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo002.00.2024Classic.png'
];
var textsForPlacard002 = [
    'Sister Union #2 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic',
    'Sister Union #2 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025A1',
    'Sister Union #2 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025A2',
    'Sister Union #2 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic'
];
var buttonIdsForPlacard002 = [
    'UStoreButton005.014.03A',
    'UStoreButton005.014.02A',
    'UStoreButton005.014.04A',
    'UStoreButton005.014.01A'
];
var buttonSkusForPlacard002 = [
    'UStoreButton005.014.03A', // SKU for UminionLogo002.02.2025Classic.png
    'UStoreButton005.014.02A', // SKU for UminionLogo002.01.2025Classic.png
    'UStoreButton005.014.04A', // SKU for UminionLogo002.03.2025Classic.png
    'UStoreButton005.014.01A'  // SKU for UminionLogo002.00.2024Classic.png
];

var currentIndexForPlacard002 = 0;

function changeImageForPlacard002(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard002 = (currentIndexForPlacard002 + 1) % imagesForPlacard002.length;
    } else if (direction === 'down') {
        currentIndexForPlacard002 = (currentIndexForPlacard002 - 1 + imagesForPlacard002.length) % imagesForPlacard002.length;
    }

    // Update the background image of the placard
    document.getElementById('placard002').style.backgroundImage = "url('" + imagesForPlacard002[currentIndexForPlacard002] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer').innerHTML = textsForPlacard002[currentIndexForPlacard002];

    // Update button id and data-sku attributes
    const button = document.querySelector('#placard002 button');
    button.id = buttonIdsForPlacard002[currentIndexForPlacard002];
    button.setAttribute('data-sku', buttonSkusForPlacard002[currentIndexForPlacard002]);
}





// this stuff is for Placard 003: *****************************************


    var imagesForPlacard003 = [
    '/StoreProductsAndImagery/UminionLogo003.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo003.02.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo003.00.2024Classic.png'
];
var textsForPlacard003 = [
    'Sister Union #3 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic',
    'Sister Union #3 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025A1',
    'Sister Union #3 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic'
];
var buttonIdsForPlacard003 = [
    'UStoreButton005.015.02A', // Image 1: UminionLogo003.01.2025Classic.png
    'UStoreButton005.015.03A', // Image 2: UminionLogo003.02.2025Classic.png
    'UStoreButton005.015.01A'  // Image 3: UminionLogo003.00.2024Classic.png
];
var buttonSkusForPlacard003 = [
    'UStoreButton005.015.02A', // SKU for UminionLogo003.01.2025Classic.png
    'UStoreButton005.015.03A', // SKU for UminionLogo003.02.2025Classic.png
    'UStoreButton005.015.01A'  // SKU for UminionLogo003.00.2024Classic.png
];

var currentIndexForPlacard003 = 0;

function changeImageForPlacard003(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard003 = (currentIndexForPlacard003 + 1) % imagesForPlacard003.length;
    } else if (direction === 'down') {
        currentIndexForPlacard003 = (currentIndexForPlacard003 - 1 + imagesForPlacard003.length) % imagesForPlacard003.length;
    }

    // Update the background image of the placard
    document.getElementById('placard003').style.backgroundImage = "url('" + imagesForPlacard003[currentIndexForPlacard003] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer003').innerHTML = textsForPlacard003[currentIndexForPlacard003];

    // Update button id and data-sku attributes
    const button = document.querySelector('#placard003 button');
    button.id = buttonIdsForPlacard003[currentIndexForPlacard003];
    button.setAttribute('data-sku', buttonSkusForPlacard003[currentIndexForPlacard003]);
}






// this stuff is for Placard 004: *****************************************
    
    var imagesForPlacard004 = [
    '/StoreProductsAndImagery/UminionLogo004.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo004.00.2024Classic.png'
];
var textsForPlacard004 = [
    'Sister Union #4 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic',
    'Sister Union #4 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic'
];
var buttonIdsForPlacard004 = [
    'UStoreButton005.016.02A', // Button ID for UminionLogo004.01.2025Classic.png
    'UStoreButton005.016.01A'  // Button ID for UminionLogo004.00.2024Classic.png
];
var buttonSkusForPlacard004 = [
    'UStoreButton005.016.02A', // SKU for UminionLogo004.01.2025Classic.png
    'UStoreButton005.016.01A'  // SKU for UminionLogo004.00.2024Classic.png
];

var currentIndexForPlacard004 = 0;

function changeImageForPlacard004(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard004 = (currentIndexForPlacard004 + 1) % imagesForPlacard004.length;
    } else if (direction === 'down') {
        currentIndexForPlacard004 = (currentIndexForPlacard004 - 1 + imagesForPlacard004.length) % imagesForPlacard004.length;
    }

    // Update the background image of the placard
    document.getElementById('placard004').style.backgroundImage = "url('" + imagesForPlacard004[currentIndexForPlacard004] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer004').innerHTML = textsForPlacard004[currentIndexForPlacard004];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard004 button');
    button.id = buttonIdsForPlacard004[currentIndexForPlacard004];
    button.setAttribute('data-sku', buttonSkusForPlacard004[currentIndexForPlacard004]);
}





// this stuff is for Placard 005: *****************************************


    var imagesForPlacard005 = [
    '/StoreProductsAndImagery/UminionLogo005.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo005.00.2024Classic.png'
];
var textsForPlacard005 = [
    'Sister Union #5 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic',
    'Sister Union #5 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic'
];
var buttonIdsForPlacard005 = [
    'UStoreButton005.017.02A', // Button ID for UminionLogo005.01.2025Classic.png
    'UStoreButton005.017.01A'  // Button ID for UminionLogo005.00.2024Classic.png
];
var buttonSkusForPlacard005 = [
    'UStoreButton005.017.02A', // SKU for UminionLogo005.01.2025Classic.png
    'UStoreButton005.017.01A'  // SKU for UminionLogo005.00.2024Classic.png
];

var currentIndexForPlacard005 = 0;

function changeImageForPlacard005(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard005 = (currentIndexForPlacard005 + 1) % imagesForPlacard005.length;
    } else if (direction === 'down') {
        currentIndexForPlacard005 = (currentIndexForPlacard005 - 1 + imagesForPlacard005.length) % imagesForPlacard005.length;
    }

    // Update the background image of the placard
    document.getElementById('placard005').style.backgroundImage = "url('" + imagesForPlacard005[currentIndexForPlacard005] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer005').innerHTML = textsForPlacard005[currentIndexForPlacard005];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard005 button');
    button.id = buttonIdsForPlacard005[currentIndexForPlacard005];
    button.setAttribute('data-sku', buttonSkusForPlacard005[currentIndexForPlacard005]);
}



// this stuff is for Placard 006: *****************************************

    var imagesForPlacard006 = [
    '/StoreProductsAndImagery/UminionLogo006.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo006.02.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo006.00.2024Classic.png'
];
var textsForPlacard006 = [
    'Sister Union #6 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic',
    'Sister Union #6 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025A1',
    'Sister Union #6 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic'
];
var buttonIdsForPlacard006 = [
    'UStoreButton005.018.02A', // Button ID for UminionLogo006.01.2025Classic.png
    'UStoreButton005.018.03A', // Button ID for UminionLogo006.02.2025Classic.png
    'UStoreButton005.018.01A'  // Button ID for UminionLogo006.00.2024Classic.png
];
var buttonSkusForPlacard006 = [
    'UStoreButton005.018.02A', // SKU for UminionLogo006.01.2025Classic.png
    'UStoreButton005.018.03A', // SKU for UminionLogo006.02.2025Classic.png
    'UStoreButton005.018.01A'  // SKU for UminionLogo006.00.2024Classic.png
];

var currentIndexForPlacard006 = 0;

function changeImageForPlacard006(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard006 = (currentIndexForPlacard006 + 1) % imagesForPlacard006.length;
    } else if (direction === 'down') {
        currentIndexForPlacard006 = (currentIndexForPlacard006 - 1 + imagesForPlacard006.length) % imagesForPlacard006.length;
    }

    // Update the background image of the placard
    document.getElementById('placard006').style.backgroundImage = "url('" + imagesForPlacard006[currentIndexForPlacard006] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer006').innerHTML = textsForPlacard006[currentIndexForPlacard006];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard006 button');
    button.id = buttonIdsForPlacard006[currentIndexForPlacard006];
    button.setAttribute('data-sku', buttonSkusForPlacard006[currentIndexForPlacard006]);
}



// this stuff is for Placard 007: *****************************************
var imagesForPlacard007 = [
    '/StoreProductsAndImagery/UminionLogo007.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo007.02.2025A1.png',
    '/StoreProductsAndImagery/UminionLogo007.03.2025A2.png',
    '/StoreProductsAndImagery/UminionLogo007.04.2025A3.png',
    '/StoreProductsAndImagery/UminionLogo007.00.2024Classic.png'
];
var textsForPlacard007 = [
    'Sister Union #7 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic',
    'Sister Union #7 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025A1',
    'Sister Union #7 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025A2',
    'Sister Union #7 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025A3',
    'Sister Union #7 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic'
];
var buttonIdsForPlacard007 = [
    'UStoreButton005.019.02A', // Button ID for UminionLogo007.01.2025Classic.png
    'UStoreButton005.019.03A', // Button ID for UminionLogo007.02.2025A1.png
    'UStoreButton005.019.04A', // Button ID for UminionLogo007.03.2025A2.png
    'UStoreButton005.019.05A', // Button ID for UminionLogo007.04.2025A3.png
    'UStoreButton005.019.01A'  // Button ID for UminionLogo007.00.2024Classic.png
];
var buttonSkusForPlacard007 = [
    'UStoreButton005.019.02A', // SKU for UminionLogo007.01.2025Classic.png
    'UStoreButton005.019.03A', // SKU for UminionLogo007.02.2025A1.png
    'UStoreButton005.019.04A', // SKU for UminionLogo007.03.2025A2.png
    'UStoreButton005.019.05A', // SKU for UminionLogo007.04.2025A3.png
    'UStoreButton005.019.01A'  // SKU for UminionLogo007.00.2024Classic.png
];

var currentIndexForPlacard007 = 0;

function changeImageForPlacard007(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard007 = (currentIndexForPlacard007 + 1) % imagesForPlacard007.length;
    } else if (direction === 'down') {
        currentIndexForPlacard007 = (currentIndexForPlacard007 - 1 + imagesForPlacard007.length) % imagesForPlacard007.length;
    }

    // Update the background image of the placard
    document.getElementById('placard007').style.backgroundImage = "url('" + imagesForPlacard007[currentIndexForPlacard007] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer007').innerHTML = textsForPlacard007[currentIndexForPlacard007];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard007 button');
    button.id = buttonIdsForPlacard007[currentIndexForPlacard007];
    button.setAttribute('data-sku', buttonSkusForPlacard007[currentIndexForPlacard007]);
}


// this stuff is for Placard 008: *****************************************




    var imagesForPlacard008 = [
    '/StoreProductsAndImagery/UminionLogo008.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo008.02.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo008.00.2024Classic.png'
];
var textsForPlacard008 = [
    'Sister Union #8 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025 Classic',
    'Sister Union #8 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025A1',
    'Sister Union #8 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic'
];
var buttonIdsForPlacard008 = [
    'UStoreButton005.020.02A', // Button ID for UminionLogo008.01.2025Classic.png
    'UStoreButton005.020.03A', // Button ID for UminionLogo008.02.2025Classic.png
    'UStoreButton005.020.01A'  // Button ID for UminionLogo008.00.2024Classic.png
];
var buttonSkusForPlacard008 = [
    'UStoreButton005.020.02A', // SKU for UminionLogo008.01.2025Classic.png
    'UStoreButton005.020.03A', // SKU for UminionLogo008.02.2025Classic.png
    'UStoreButton005.020.01A'  // SKU for UminionLogo008.00.2024Classic.png
];

var currentIndexForPlacard008 = 0;

function changeImageForPlacard008(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard008 = (currentIndexForPlacard008 + 1) % imagesForPlacard008.length;
    } else if (direction === 'down') {
        currentIndexForPlacard008 = (currentIndexForPlacard008 - 1 + imagesForPlacard008.length) % imagesForPlacard008.length;
    }

    // Update the background image of the placard
    document.getElementById('placard008').style.backgroundImage = "url('" + imagesForPlacard008[currentIndexForPlacard008] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer008').innerHTML = textsForPlacard008[currentIndexForPlacard008];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard008 button');
    button.id = buttonIdsForPlacard008[currentIndexForPlacard008];
    button.setAttribute('data-sku', buttonSkusForPlacard008[currentIndexForPlacard008]);
}



    // this stuff is for Placard 009: *****************************************

var imagesForPlacard009 = [
    '/StoreProductsAndImagery/UminionLogo009.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard009 = [
    'Sister Union #9 of 9: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard009 = [
    'UStoreButton005.021.01A', // Button ID for UminionLogo009.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard009 = [
    'UStoreButton005.021.01A', // SKU for UminionLogo009.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard009 = 0;

function changeImageForPlacard009(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard009 = (currentIndexForPlacard009 + 1) % imagesForPlacard009.length;
    } else if (direction === 'down') {
        currentIndexForPlacard009 = (currentIndexForPlacard009 - 1 + imagesForPlacard009.length) % imagesForPlacard009.length;
    }

    // Update the background image of the placard
    document.getElementById('placard009').style.backgroundImage = "url('" + imagesForPlacard009[currentIndexForPlacard009] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer009').innerHTML = textsForPlacard009[currentIndexForPlacard009];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard009 button');
    button.id = buttonIdsForPlacard009[currentIndexForPlacard009];
    button.setAttribute('data-sku', buttonSkusForPlacard009[currentIndexForPlacard009]);
}



// this stuff is for Placard 010: *****************************************

    var imagesForPlacard010 = [
    '/StoreProductsAndImagery/UminionLogo010.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard010 = [
    'Sister Union #10: <br>"Union Hall" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard010 = [
    'UStoreButton005.022.01A', // Button ID for UminionLogo010.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard010 = [
    'UStoreButton005.022.01A', // SKU for UminionLogo010.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard010 = 0;

function changeImageForPlacard010(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard010 = (currentIndexForPlacard010 + 1) % imagesForPlacard010.length;
    } else if (direction === 'down') {
        currentIndexForPlacard010 = (currentIndexForPlacard010 - 1 + imagesForPlacard010.length) % imagesForPlacard010.length;
    }

    // Update the background image of the placard
    document.getElementById('placard010').style.backgroundImage = "url('" + imagesForPlacard010[currentIndexForPlacard010] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer010').innerHTML = textsForPlacard010[currentIndexForPlacard010];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard010 button');
    button.id = buttonIdsForPlacard010[currentIndexForPlacard010];
    button.setAttribute('data-sku', buttonSkusForPlacard010[currentIndexForPlacard010]);
}



// this stuff is for Placard 011: *****************************************
    
    var imagesForPlacard011 = [
    '/StoreProductsAndImagery/UminionLogo011.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard011 = [
    'Sister Union #11: <br>"Union Waterfall" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard011 = [
    'UStoreButton005.023.01A', // Button ID for UminionLogo011.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard011 = [
    'UStoreButton005.023.01A', // SKU for UminionLogo011.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard011 = 0;

function changeImageForPlacard011(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard011 = (currentIndexForPlacard011 + 1) % imagesForPlacard011.length;
    } else if (direction === 'down') {
        currentIndexForPlacard011 = (currentIndexForPlacard011 - 1 + imagesForPlacard011.length) % imagesForPlacard011.length;
    }

    // Update the background image of the placard
    document.getElementById('placard011').style.backgroundImage = "url('" + imagesForPlacard011[currentIndexForPlacard011] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer011').innerHTML = textsForPlacard011[currentIndexForPlacard011];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard011 button');
    button.id = buttonIdsForPlacard011[currentIndexForPlacard011];
    button.setAttribute('data-sku', buttonSkusForPlacard011[currentIndexForPlacard011]);
}




// this stuff is for Placard 012: *****************************************


    var imagesForPlacard012 = [
    '/StoreProductsAndImagery/UminionLogo012.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard012 = [
    'Sister Union #12: <br>"Union Event" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard012 = [
    'UStoreButton005.024.01A', // Button ID for UminionLogo012.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard012 = [
    'UStoreButton005.024.01A', // SKU for UminionLogo012.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard012 = 0;

function changeImageForPlacard012(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard012 = (currentIndexForPlacard012 + 1) % imagesForPlacard012.length;
    } else if (direction === 'down') {
        currentIndexForPlacard012 = (currentIndexForPlacard012 - 1 + imagesForPlacard012.length) % imagesForPlacard012.length;
    }

    // Update the background image of the placard
    document.getElementById('placard012').style.backgroundImage = "url('" + imagesForPlacard012[currentIndexForPlacard012] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer012').innerHTML = textsForPlacard012[currentIndexForPlacard012];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard012 button');
    button.id = buttonIdsForPlacard012[currentIndexForPlacard012];
    button.setAttribute('data-sku', buttonSkusForPlacard012[currentIndexForPlacard012]);
}



// this stuff is for Placard 013: *****************************************
var imagesForPlacard013 = [
    '/StoreProductsAndImagery/UminionLogo013.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo013.00.2024Classic.png'
];
var textsForPlacard013 = [
    'Sister Union #13: <br>"Union Support" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2025 Classic',
    'Sister Union #13: <br>"Union Support" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic'
];
var buttonIdsForPlacard013 = [
    'UStoreButton005.025.02A', // Button ID for UminionLogo013.01.2025Classic.png
    'UStoreButton005.025.01A'  // Button ID for UminionLogo013.00.2024Classic.png
];
var buttonSkusForPlacard013 = [
    'UStoreButton005.025.02A', // SKU for UminionLogo013.01.2025Classic.png
    'UStoreButton005.025.01A'  // SKU for UminionLogo013.00.2024Classic.png
];

var currentIndexForPlacard013 = 0;

function changeImageForPlacard013(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard013 = (currentIndexForPlacard013 + 1) % imagesForPlacard013.length;
    } else if (direction === 'down') {
        currentIndexForPlacard013 = (currentIndexForPlacard013 - 1 + imagesForPlacard013.length) % imagesForPlacard013.length;
    }

    // Update the background image of the placard
    document.getElementById('placard013').style.backgroundImage = "url('" + imagesForPlacard013[currentIndexForPlacard013] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer013').innerHTML = textsForPlacard013[currentIndexForPlacard013];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard013 button');
    button.id = buttonIdsForPlacard013[currentIndexForPlacard013];
    button.setAttribute('data-sku', buttonSkusForPlacard013[currentIndexForPlacard013]);
}



// this stuff is for Placard 014: *****************************************

    var imagesForPlacard014 = [
    '/StoreProductsAndImagery/UminionLogo014.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard014 = [
    'Sister Union #14: <br>"Union News" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard014 = [
    'UStoreButton005.026.01A', // Button ID for UminionLogo014.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard014 = [
    'UStoreButton005.026.01A', // SKU for UminionLogo014.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard014 = 0;

function changeImageForPlacard014(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard014 = (currentIndexForPlacard014 + 1) % imagesForPlacard014.length;
    } else if (direction === 'down') {
        currentIndexForPlacard014 = (currentIndexForPlacard014 - 1 + imagesForPlacard014.length) % imagesForPlacard014.length;
    }

    // Update the background image of the placard
    document.getElementById('placard014').style.backgroundImage = "url('" + imagesForPlacard014[currentIndexForPlacard014] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer014').innerHTML = textsForPlacard014[currentIndexForPlacard014];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard014 button');
    button.id = buttonIdsForPlacard014[currentIndexForPlacard014];
    button.setAttribute('data-sku', buttonSkusForPlacard014[currentIndexForPlacard014]);
}



// this stuff is for Placard 015: *****************************************

    var imagesForPlacard015 = [
    '/StoreProductsAndImagery/UminionLogo015.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard015 = [
    'Sister Union #15: <br>"Union Radio" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard015 = [
    'UStoreButton005.027.01A', // Button ID for UminionLogo015.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard015 = [
    'UStoreButton005.027.01A', // SKU for UminionLogo015.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard015 = 0;

function changeImageForPlacard015(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard015 = (currentIndexForPlacard015 + 1) % imagesForPlacard015.length;
    } else if (direction === 'down') {
        currentIndexForPlacard015 = (currentIndexForPlacard015 - 1 + imagesForPlacard015.length) % imagesForPlacard015.length;
    }

    // Update the background image of the placard
    document.getElementById('placard015').style.backgroundImage = "url('" + imagesForPlacard015[currentIndexForPlacard015] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer015').innerHTML = textsForPlacard015[currentIndexForPlacard015];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard015 button');
    button.id = buttonIdsForPlacard015[currentIndexForPlacard015];
    button.setAttribute('data-sku', buttonSkusForPlacard015[currentIndexForPlacard015]);
}



    // this stuff is for Placard 016: *****************************************

    var imagesForPlacard016 = [
    '/StoreProductsAndImagery/UminionLogo016.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard016 = [
    'Sister Union #16: <br>"Union Drive" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard016 = [
    'UStoreButton005.028.01A', // Button ID for UminionLogo016.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard016 = [
    'UStoreButton005.028.01A', // SKU for UminionLogo016.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard016 = 0;

function changeImageForPlacard016(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard016 = (currentIndexForPlacard016 + 1) % imagesForPlacard016.length;
    } else if (direction === 'down') {
        currentIndexForPlacard016 = (currentIndexForPlacard016 - 1 + imagesForPlacard016.length) % imagesForPlacard016.length;
    }

    // Update the background image of the placard
    document.getElementById('placard016').style.backgroundImage = "url('" + imagesForPlacard016[currentIndexForPlacard016] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer016').innerHTML = textsForPlacard016[currentIndexForPlacard016];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard016 button');
    button.id = buttonIdsForPlacard016[currentIndexForPlacard016];
    button.setAttribute('data-sku', buttonSkusForPlacard016[currentIndexForPlacard016]);
}

// this stuff is for Placard 017: *****************************************

    var imagesForPlacard017 = [
    '/StoreProductsAndImagery/UminionLogo017.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard017 = [
    'Sister Union #17: <br>"Union Archive & Education" -2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard017 = [
    'UStoreButton005.029.01A', // Button ID for UminionLogo017.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard017 = [
    'UStoreButton005.029.01A', // SKU for UminionLogo017.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard017 = 0;

function changeImageForPlacard017(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard017 = (currentIndexForPlacard017 + 1) % imagesForPlacard017.length;
    } else if (direction === 'down') {
        currentIndexForPlacard017 = (currentIndexForPlacard017 - 1 + imagesForPlacard017.length) % imagesForPlacard017.length;
    }

    // Update the background image of the placard
    document.getElementById('placard017').style.backgroundImage = "url('" + imagesForPlacard017[currentIndexForPlacard017] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer017').innerHTML = textsForPlacard017[currentIndexForPlacard017];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard017 button');
    button.id = buttonIdsForPlacard017[currentIndexForPlacard017];
    button.setAttribute('data-sku', buttonSkusForPlacard017[currentIndexForPlacard017]);
}


// this stuff is for Placard 018: *****************************************

    var imagesForPlacard018 = [
    '/StoreProductsAndImagery/UminionLogo018.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard018 = [
    'Sister Union #18: <br>"Union Tech" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard018 = [
    'UStoreButton005.030.01A', // Button ID for UminionLogo018.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard018 = [
    'UStoreButton005.030.01A', // SKU for UminionLogo018.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard018 = 0;

function changeImageForPlacard018(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard018 = (currentIndexForPlacard018 + 1) % imagesForPlacard018.length;
    } else if (direction === 'down') {
        currentIndexForPlacard018 = (currentIndexForPlacard018 - 1 + imagesForPlacard018.length) % imagesForPlacard018.length;
    }

    // Update the background image of the placard
    document.getElementById('placard018').style.backgroundImage = "url('" + imagesForPlacard018[currentIndexForPlacard018] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer018').innerHTML = textsForPlacard018[currentIndexForPlacard018];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard018 button');
    button.id = buttonIdsForPlacard018[currentIndexForPlacard018];
    button.setAttribute('data-sku', buttonSkusForPlacard018[currentIndexForPlacard018]);
}


// this stuff is for Placard 019: *****************************************

var imagesForPlacard019 = [
    '/StoreProductsAndImagery/UminionLogo019.00.2024Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard019 = [
    'Sister Union #19: <br>"Union Politic" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic',
    'Coming Soon!',
    'Coming Soon!'
];
var buttonIdsForPlacard019 = [
    'UStoreButton005.031.01A', // Button ID for UminionLogo019.00.2024Classic.png
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard019 = [
    'UStoreButton005.031.01A', // SKU for UminionLogo019.00.2024Classic.png
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard019 = 0;

function changeImageForPlacard019(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard019 = (currentIndexForPlacard019 + 1) % imagesForPlacard019.length;
    } else if (direction === 'down') {
        currentIndexForPlacard019 = (currentIndexForPlacard019 - 1 + imagesForPlacard019.length) % imagesForPlacard019.length;
    }

    // Update the background image of the placard
    document.getElementById('placard019').style.backgroundImage = "url('" + imagesForPlacard019[currentIndexForPlacard019] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer019').innerHTML = textsForPlacard019[currentIndexForPlacard019];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard019 button');
    button.id = buttonIdsForPlacard019[currentIndexForPlacard019];
    button.setAttribute('data-sku', buttonSkusForPlacard019[currentIndexForPlacard019]);
}


// this stuff is for Placard 020: *****************************************
    
var imagesForPlacard020 = [
    '/StoreProductsAndImagery/UminionLogo000.01.2025Classic.png',
    '/StoreProductsAndImagery/UminionLogo000.00.2024Classic.png'
];
var textsForPlacard020 = [
    'Sister Union #00: <br>"Union HQ" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2025 Classic',
    'Sister Union #00: <br>"Union HQ" <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2024 Classic'
];
var buttonIdsForPlacard020 = [
    'UStoreButton005.000.02A', // Button ID for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // Button ID for UminionLogo000.00.2024Classic.png
];
var buttonSkusForPlacard020 = [
    'UStoreButton005.000.02A', // SKU for UminionLogo000.01.2025Classic.png
    'UStoreButton005.000.01A'  // SKU for UminionLogo000.00.2024Classic.png
];

var currentIndexForPlacard020 = 0;

function changeImageForPlacard020(direction) {
    // Update the index based on the direction
    if (direction === 'up') {
        currentIndexForPlacard020 = (currentIndexForPlacard020 + 1) % imagesForPlacard020.length;
    } else if (direction === 'down') {
        currentIndexForPlacard020 = (currentIndexForPlacard020 - 1 + imagesForPlacard020.length) % imagesForPlacard020.length;
    }

    // Update the background image of the placard
    document.getElementById('placard020').style.backgroundImage = "url('" + imagesForPlacard020[currentIndexForPlacard020] + "')";

    // Update the text container with the corresponding text
    document.getElementById('textContainer020').innerHTML = textsForPlacard020[currentIndexForPlacard020];

    // Update the button ID and data-sku attributes
    const button = document.querySelector('#placard020 button');
    button.id = buttonIdsForPlacard020[currentIndexForPlacard020];
    button.setAttribute('data-sku', buttonSkusForPlacard020[currentIndexForPlacard020]);
}


// this script content above is for the 20 billboard store when it comes to their images and up and down arrows:


































































    













// ********NotDOMed**************Part 37







//THIS SCRIPT BELOW IS FOR THE AD00002:
let currentIndex00002 = 0; // Initialize the current index to 0
const placards00002 = document.querySelectorAll('.placard00002'); // Select all elements with the class 'placard00002'
const placardContainer00002 = document.querySelector('.placard-container00002'); // Select the element with the class 'placard-container00002'

// Function to rotate to a specific placard
function showPlacard00002(index) {
    placardContainer00002.style.transform = `rotateY(${-index * 90}deg)`; // Adjust rotation angle based on index
    currentIndex00002 = index; // Update the current index
}

// Function to show the next placard
function showNextPlacard00002() {
    showPlacard00002((currentIndex00002 + 1) % placards00002.length); // Increment the index and wrap around using modulo
}

// Function to show the previous placard
function showPreviousPlacard00002() {
    showPlacard00002((currentIndex00002 - 1 + placards00002.length) % placards00002.length); // Decrement the index and wrap around using modulo
}

// Automatic rotation every 3 seconds
let rotationInterval00002 = setInterval(showNextPlacard00002, 4500); // Set an interval to show the next placard every 4.5 seconds

// Pause rotation on hover
placardContainer00002.addEventListener('mouseover', () => {
    clearInterval(rotationInterval00002); // Clear the interval to stop rotation when hovering
});

// Resume rotation when not hovering
placardContainer00002.addEventListener('mouseout', () => {
    rotationInterval00002 = setInterval(showNextPlacard00002, 4500); // Reset the interval to resume rotation when not hovering
});

// Add event listeners for navigation arrows
document.querySelectorAll('.left-arrow00002').forEach(arrow => {
    arrow.addEventListener('click', showPreviousPlacard00002); // Add click event listener to show the previous placard
});
document.querySelectorAll('.right-arrow00002').forEach(arrow => {
    arrow.addEventListener('click', showNextPlacard00002); // Add click event listener to show the next placard
});

// Add event listeners for placard clicks to open a new tab to WhatsYorStory.com
placards00002.forEach((placard, index) => {
    if (index === 1 || index === 3) { // Second and fourth placard
        placard.addEventListener('click', () => {
            window.open('https://WhatsYorStory.com', '_blank'); // Open WhatsYorStory.com in a new tab when clicked
        });
    }
});

//THIS SCRIPT ABOVE IS FOR THE AD00002:
















// ********NotDOMed**************Part 38








//this content in here was for ad00003; which has been temporarily removed. -8:21am on 2/1/25 through mergethisversion035.01+













// ********NotDOMed**************Part 39




//This Script below is for terms of service/terms of use thang:

    
    let isTooltipVisible = false;

function showTooltip(elem, text) {
  if (isTooltipVisible) return;

  let tooltip = document.createElement('span');
  tooltip.innerText = text;
  tooltip.className = 'tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.top = '40px';
  tooltip.style.left = '0';  // Adjust based on your needs
  tooltip.style.maxWidth = '750px';  // Set max width
  tooltip.style.background = '#f0f0f0';
  tooltip.style.color = '#333';
  tooltip.style.border = '1px solid #ccc';
  tooltip.style.borderRadius = '4px';
  tooltip.style.padding = '10px';
  tooltip.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  tooltip.style.zIndex = '1000000';

  elem.appendChild(tooltip);
  isTooltipVisible = true;

  // Hide tooltip when clicking outside
  document.addEventListener('click', (event) => {
    if (!elem.contains(event.target)) {
      hideTooltip(elem);
    }
  });
}

function hideTooltip(elem) {
  let tooltip = elem.querySelector('.tooltip');
  if (tooltip) {
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    setTimeout(() => {
      if (tooltip) {
        elem.removeChild(tooltip);
        isTooltipVisible = false;
      }
    }, 200);
  }
}

// Toggle tooltip on click
document.querySelector('.footer-link').addEventListener('click', (event) => {
  event.preventDefault();  // Prevent the default action
  event.stopPropagation();
  let elem = event.currentTarget;
  if (isTooltipVisible) {
    hideTooltip(elem);
  } else {
    showTooltip(elem, "By interacting with this site (via sharing an audio/video recording and/or interacting with:> 'The Calendar/Archive/Stores full of entries:') <:-you agree to our: 'Terms of Service/Terms of Use' & confirm you've reviewed our 'Privacy Statement.'\n\nTerms of Service/Terms of Use -&- Privacy Statement for:\n\n\"Uminion.com\"\n\nUminion is a \"Roar & Rally\" Union.\nA Union of people, that, every 24th of the month; from 9am to 9pm; \nrally outside of local City Halls & State Houses; and ROAR for a higher tied to inflation minimum wage.\n\nThis website, is to help fruition this union's goal into reality.\n\nAll shared content that gets added to this site's calendar and the archive: 'becomes part of Uminions copyrighted (& commercial use) property' to help clean up the site (via deleting any content not helping us reach our goals) & to help self-finance a movement that helps raise a tied to inflation minimum wage.\n\nThis website will be runned by the Uminion Union's General Union Secretary (G.U.S. (Presently, the G.U.S., is the creator of the Uminion Union: \"StorytellingSalem\")).\n\nProfits made from products sold from Uminion.com's stores; will be split into three parts:> 33% goes to the Uminion Treasury's Cash at Hand (To help pay for any immediate bills & people; taken care of by the G.U.S.). 33% goes to either the Person/Sister Union selling such a product/ or The Union Treasury/Uminion Treasury (for example: If someone buys a Sister Union #01 Poster. This 33% would go to Sister Union #01. But if that person buys a Tapestry involving all the sister unions and then some. Then such 33% goes to the general Union Treasury). & the remaining 34%, goes to the: Union Treasury/Uminion Treasury. At the beginning of each month, 33% of the collective Union Treasury (and 33% of each respective sister union's treasury), gets moved to the Uminion Treasury's Cash at Hand to make sure we're not behind on any bills/payments- managed by the G.U.S.\n\nWhen it comes to certain products being sold: ***A.) All Posters sold through the Union, unless product runs out, are: 'Sticker Posters.' Posters that can be used as Posters, or large Stickers (Sticker-Posters).\n ***B.) Unless a custom special is going on, Bracelets are made out of silicone.\n Unless a special event is going on, the general rule of thumb for bracelets are: \n***1.) If one buys a regular bracelet. The Main Color is Orange. \n***2.) if one buys a regular bracelet, along, with a Union Membership Card; then the main color is Black (with, when supplies last: orange secondary color). \n***3.) When someone signs up for Uminion News Weekly Subscription, after 10 consistent weeks, they can sign up to receive their free gold (colored) bracelet'. \n***4.) When someone signs up for Uminion News Monthly Subscription, after 10 consistent months, they can sign up to receive their free gold (colored with black secondary colored) bracelet'. \n ***C.) BYO (& BYOCT) Tapestry stands for 'Build Your Own (Custom) Tapestry.' Meaning, pending on the option, we either send you a set amount of posters, that, when put together- create a large tapestry. &/or if you wish to custom put them in any order you want, the BYOCT option- allows you to get all of the posters; to customize your sized tapestry(/ies) however way you wish.\n ***D.) The Support for the Ukraine initiative (raising money for ammo & selling ukranian posters to fund the war effort) through Uminion is fully runned by the G.U.S (StorytellingSalem) and all questions should be directed to him. \n ***E.) Participating in the montly/weekly subscription for Union News means you are helping support Uminion.com with a weekly and/or monthly contribution. Union News will be the main benefactor of this contribution, to help keep Uminion Radio/Union Radio/Union News/Uminion News alive. \n ***F.) The general rule of thumb, for T-Shirt sizes we are working with, are as followed: \n S= 28inches Body Length 18inches Body Width (laid flat) \n M= 29 1/4inches Body Length 20inches Body Width (laid flat) \n L= 30 1/4inches Body Length 22inches Body Width (laid flat) \n XL= 31 1/4inches Body Length 24inches Body Width (laid flat) \n 2XL= 32 1/2inches Body Length 26inches Body Width (laid flat) \n 3XL= 33 1/2inches Body Length 28inches Body Width (laid flat) \n ***G.) When one purchases a 'Union Card;' one will receive two cards. They will both be signed by the G.U.S. The first card is for the receiver to sign and keep. The second card is to sign and send back to the G.U.S., so they can add it to the official record; along with everyone else's signed cards. This is how we know: who are official members. \n ***H.) All Donations made to the Uminion Union go directly into the Union Treasury. \n\nSister Union Treasury is accessable via the 100hr debate, once, 100 members from that Sister Union, participate in the monthly \"Union Roar & Rally Event\". (Example: if:> \"Sister Union #02 had 200 members come out for the Roar & Rally.\" <:then:> \"Those 200 members can discuss and vote on- how this Sister Union's Treasury gets invested/spent/used up -during their 100hr debate.\" )\n\nUnion Treasury is accessable via the 100hr debate, once, more than half of the Sister Unions each have 100 members from each of those Sister Unions, participate in the monthly \"Union Roar & Rally Event\". (Example: if 5 of 9 Sister Unions, each have, 100 members, from each of those Sister Unions, participate in the monthly event. Then those people have access to vote and decide on how to use up the Union Treasury money.)\n\nThis website is presently in its BETA Stage. So many features are still on their way; and any help finding bugs (or ideas for features) would be greatly appreciated.\n\nFor that: 'Any shared audios/videos/content (which are, what gets shared after any of the 'Submit Buttons' have been clicked:) are presently un-deletable.'\nBecause of this, it is recommended, that anything be shared, be shared: anonymously.\n(As in, this site recommends NOT sharing your name [nor other personal details].\n\n{*Because of these Terms of Use and Privacy Statement, this site, through the G.U.S., does reserve the right to update (& upgrade) our Terms of Use/Terms of Service- and Privacy Policy- as time goes by, aswell as delete [anything else found in Uminion.com'] any submitted entries, that may include someone else's name and/or personal details and/or anything of the like that hinders the goals of this Union's Mission, Site, & future evolving goals.\n& for that, any and all Content submitted, transfer all Copyrights & Commercial Use Rights of such content to only this Site, to be able to delete/hide/modify and/or use/sell/distribute (anyway that the G.U.S sees fit) to keep The Uminion Union & Site financed, live, & running- for multi-generations.*}\n\nBut this site, does not intend to delete, regardless of the details of the content shared.)\n\n ('Terms of Service & Privacy Policy' as of: 2/1/25+)");
  }
});


//This script above is for terms of service/terms of use thang:



























// ********NotDOMed**************Part 40 Note:> This stuff seems missing for some reason? its in MergeThisVersion027.04 but not here for some reason?



    function addToRecentlyPlayed002(entry, type) {
        // Add the most recently played entry to the beginning of the list
        recentlyPlayed002.unshift({ ...entry, type });

        // Keep only the 3 most recent entries
        if (recentlyPlayed002.length > 3) {
            recentlyPlayed002.pop();
        }

        // Update the recently played section
        const recentlyPlayedContainer = document.getElementById('headerRightContainer005');
        recentlyPlayedContainer.innerHTML = recentlyPlayed002.map(item => `
            <div>
                <button class="upvote" onclick="voteUp(${item.id}, this)">⬆️</button>
                <button class="downvote" onclick="voteDown(${item.id}, this)">⬇️</button>
                <p>${item.title}</p>
                ${item.description ? `<p>${item.description}</p>` : ""}
            </div>
        `).join('');
    }




function playVideo(video) {
    const nowPlayingContainer = document.getElementById('nowPlayingContainer');
    nowPlayingContainer.innerHTML = `
        <div class="primaryContainerCenter">
            <p>${video.title}</p>
            ${video.description ? `<p>${video.description}</p>` : ""}
            <video src="${video.audioUrl}" controls></video>
            <button class="upvote" onclick="voteUp(${video.id}, this)">⬆️</button>
            <button class="downvote" onclick="voteDown(${video.id}, this)">⬇️</button>
        </div>
    `;
    video.playing = true;

    const videoElement = nowPlayingContainer.querySelector('video');
    videoElement.play();
    videoElement.onended = () => {
        video.playing = false;
        addToRecentlyPlayed(video, 'video');
        updateComingUpNext();
        checkAndPlayScheduledMedia();

        // Move the image back to its original position (right by 30px)
    const bannerImage = document.querySelector('.innerDivBelowPlacard');
    bannerImage.style.left = '50%'; // Reset the left position to 50%

    // Change the min-height back to 650px
    const topLeftSection = document.querySelector('.containerForTopLeftSection');
    topLeftSection.style.minHeight = '650px'; // Change the min-height back to 650px <!-- This is related to:>>> HHHHHHHHHHHHHHHHHHHEEEEEEEEEEAAAAAAADDDDDDERRRRRRRRRRRRRRR Part 11 of 11  <<< 

    };
}




function addToRecentlyPlayed(entry, type) {
    // Add the most recently played entry to the beginning of the list
    recentlyPlayed.unshift({ ...entry, type });

    // Keep only the 3 most recent entries
    if (recentlyPlayed.length > 3) {
        recentlyPlayed.pop();
    }

    // Update the recently played section
    const recentlyPlayedContainer = document.getElementById('headerRightContainer005');
    recentlyPlayedContainer.innerHTML = recentlyPlayed.map(item => `
        <div>
            <button class="upvote" onclick="voteUp(${item.id}, this)">⬆️</button>
            <button class="downvote" onclick="voteDown(${item.id}, this)">⬇️</button>
            <p>${item.title}</p>
            ${item.description ? `<p>${item.description}</p>` : ""}
        </div>
    `).join('');
}


// Store state for successful image loads
const loadedImages = {};

function checkAndUpdateLogo(videoId, logoFile, retryCount = 0) {
    const maxRetries = 10; // Maximum number of retries
    const retryInterval = 5000; // Retry every 5 seconds
    const logoContainer = document.getElementById(`logo-${videoId}`);
    if (logoContainer) {
        // Check if the image has been successfully loaded already
        if (loadedImages[videoId]) {
            return; // Do not attempt to reload the image if it's already loaded
        }

        const logoElement = new Image();
        logoElement.src = `${BASE_PATH}${logoFile}?t=${new Date().getTime()}`; // Force reload with a timestamp
        logoElement.onload = function() {
            loadedImages[videoId] = true; // Mark as successfully loaded
            logoContainer.innerHTML = ''; // Clear spinner or GIF
            logoContainer.appendChild(logoElement); // Append the loaded image
        };
        logoElement.onerror = function() {
            if (retryCount < maxRetries) {
                // Retry after 5 seconds if the image fails to load
                setTimeout(() => checkAndUpdateLogo(videoId, logoFile, retryCount + 1), retryInterval);
            } else {
                // Stop retrying and handle the error appropriately
                logoContainer.innerHTML = 'Failed to load logo';
            }
        };
        // Display loading GIF
        logoContainer.innerHTML = '<img src="/includes/UminionRadioGIFversion06.gif" alt="Loading..." style="width: 100px; height: 100px;">';
    }
}

// Call this function right after the video is submitted and added to the calendar
function initiateLogoCheck(videoId, logoFile) {
    checkAndUpdateLogo(videoId, logoFile);

    // Perform an immediate check to see if the image file exists on the server
    const image = new Image();
    image.src = `${BASE_PATH}${logoFile}?t=${new Date().getTime()}`;
    image.onload = function() {
        // Image exists, stop further retries
        const logoContainer = document.getElementById(`logo-${videoId}`);
        if (logoContainer) {
            loadedImages[videoId] = true; // Mark as successfully loaded
            logoContainer.innerHTML = ''; // Clear spinner or GIF
            logoContainer.appendChild(image);
        }
    };
    image.onerror = function() {
        // Continue with retries if the initial check fails
        checkAndUpdateLogo(videoId, logoFile, 1);
    };
}

// ********NotDOMed**************Part 41 Note:> i upgraded this area as a 'backup' to make sure audios work at their scheduled time. -4:58pm on 1/24/25

function checkDatabaseForScheduledMedia() {
    fetch('includes/AudioScheduledTimeBackUp.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const now = new Date().getTime();
                const scheduledAudios = data.scheduledAudios;

                scheduledAudios.forEach(audio => {
                    if (!audio.playing && new Date(audio.audio_scheduled_time_to_play).getTime() <= now - 5000) { // 5 seconds past scheduled time
                        playAudio(audio);
                    }
                });
            } else {
                console.error('Error fetching scheduled media:', data.message);
            }
        })
        .catch(error => {
            console.error('Error during fetch:', error);
        });
}

setInterval(checkDatabaseForScheduledMedia, 8000); // Check the database every 8 seconds







// ********NotDOMed**************Part 41.01 this section may have been causing me issues. i upgraded it to fix the issue (of it playing when other stuff was already playing; interrupting what was playing; and making it start playing all over again at the beginning.) -12:37am on 2/1/25

function isAnyMediaPlaying() {
    const mediaElements = document.querySelectorAll('audio, video');
    for (const media of mediaElements) {
        if (!media.paused) {
            return true; // Media is currently playing
        }
    }
    return false; // No media is playing
}

function playAudio(audio) {
    const nowPlayingContainer = document.getElementById('headerRightContainer002');
    if (!nowPlayingContainer) {
        console.error('headerRightContainer002 element not found');
        return; // Exit the function if the element is not found
    }

    // Ensure the audioSrc includes the /uploads/ directory
    const audioSrc = `uploads/${audio.audio_url || audio.audioUrl}`; // Handle both property names

    console.log('Playing Audio Source URL:', audioSrc); // Log the URL

    function startPlayingAudio() {
        if (isAnyMediaPlaying()) {
            console.log('Another media is playing. Retrying in 20 seconds...');
            setTimeout(startPlayingAudio, 20000); // Retry after 20 seconds
            return;
        }

        // Check if the audio has already been played
        fetch('includes/checkAudioPlayed.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ audio_id: audio.id })
        })
            .then(response => response.json())
            .then(data => {
                if (data.played_already === 1) {
                    console.log('Audio has already been played. Skipping playback.');
                    return;
                }

                // Update Played_Already in the database
                fetch('includes/updateAudioPlayedStatus.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ audio_id: audio.id, played_already: 1 })
                });

                nowPlayingContainer.innerHTML = `
    <div style="margin-top: -250px;"> <!-- Wrap the content and apply negative margin TO MOVE THE HEIGHT OF THIS STUFF WHEN IT SHOWS UP TO PLAY AT ITS SCHEDULED TIME!-->
        <div class="primaryContainerCenter" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <p style="text-align: right;">${audio.audio_title_user_uploaded}</p>
                ${audio.audio_description ? `<p style="text-align: right;">${audio.audio_description}</p>` : ""}
                <div style="display: flex; align-items: center;">
                    <div style="margin-right: 10px;">
                        <button class="upvote" onclick="voteUp(${audio.id}, this)">⬆️</button>
                        <button class="downvote" onclick="voteDown(${audio.id}, this)">⬇️</button>
                    </div>
                    <audio src="${audioSrc}" controls style="max-width: 150px;"></audio>
                    ${audio.audio_logo_url || audio.video_logo_url ? `<img src="uploads/${audio.audio_logo_url || audio.video_logo_url}" alt="Logo" style="max-width: 100px; max-height: 100px; margin-left: 10px;">` : ""}
                </div>
            </div>
        </div>
    </div>
`;

                audio.playing = true;

                const audioElement = nowPlayingContainer.querySelector('audio');
                audioElement.play();

                audioElement.onended = () => {
                    audio.playing = false;
                    addToRecentlyPlayed(audio, 'audio');
                    updateComingUpNext();

                    // Add timestamp to `audio_time_actually_played`
                    fetch('includes/updateAudioTimePlayed.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ audio_id: audio.id })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status !== 'success') {
                                console.error('Error updating play time:', data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error during fetch:', error);
                        });
                };
            })
            .catch(error => {
                console.error('Error during fetch:', error);
            });
    }

    startPlayingAudio();
}




// ********NotDOMed**************Part 42 The ALERTS being changed to TOASTS were added in here:

function showToast00001(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-1';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showToast00002(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-2';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showToast00003(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-3';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showToast00004(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-4';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showToast00005(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-5';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showToast00006(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-6';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}



// ********NotDOMed**************Part 43 a way to stop the X button from changing the page when clicked to 'remove a recorded audio' -2:01pm on 1/31/25


document.getElementById('removeAudioBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Clear the recorded audio and reset the preview
    const audioPreview = document.getElementById('audioPreview');
    const recordedAudio = document.getElementById('recordedAudio');
    
    // Clear the audio source
    recordedAudio.src = '';
    recordedAudio.load();

    // Hide the audio preview container
    audioPreview.style.display = 'none';

    // Optionally, reset the file input if you want to clear the selected file
    const fileInput = document.getElementById('fileInput');
    fileInput.value = '';
});


// ********NotDOMed**************Part 44 Adding the bug report image and button thang in the footer =) -5:25pm on 1/31/25

function showToastForBugImage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-for-bug-image';
    toast.textContent = message;
    
    const toastContainer = document.getElementById('toastcontainerforbugimage');
    toastContainer.appendChild(toast);

    // Remove the toast after 10 seconds
    setTimeout(() => {
        toast.remove();
    }, 10000);
}

document.getElementById('bugReportImage').addEventListener('click', function() {
    showToastForBugImage('Found a Bug? Let StorytellingSalem know -in the Union Chats!');
});



// ********NotDOMed**************Part 45 adding a three sided placard uptop in the header


let currentIndex0000002 = 0;
const placards0000002 = document.querySelectorAll('.placard0000002');
const placardContainer0000002 = document.querySelector('.placard-container0000002');

// Function to rotate to a specific placard
function showPlacard0000002(index0000002) {
    placardContainer0000002.style.transform = `rotateY(${-index0000002 * 36}deg)`; // Adjust rotation angle for 10 placards
    currentIndex0000002 = index0000002;
}

// Function to show the next placard
function showNextPlacard0000002() {
    showPlacard0000002((currentIndex0000002 + 1) % placards0000002.length);
}

// Function to show the previous placard
function showPreviousPlacard0000002() {
    showPlacard0000002((currentIndex0000002 - 1 + placards0000002.length) % placards0000002.length);
}

// Automatic rotation every 3 seconds
let rotationInterval0000002 = setInterval(showNextPlacard0000002, 3000);

// Pause rotation on hover
placardContainer0000002.addEventListener('mouseover', () => {
    clearInterval(rotationInterval0000002);
});

// Resume rotation when not hovering
placardContainer0000002.addEventListener('mouseout', () => {
    rotationInterval0000002 = setInterval(showNextPlacard0000002, 3000);
});

// Add event listeners for navigation arrows
document.querySelectorAll('.left-arrow0000002').forEach(arrow0000002 => {
    arrow0000002.addEventListener('click', showPreviousPlacard0000002);
});
document.querySelectorAll('.right-arrow0000002').forEach(arrow0000002 => {
    arrow0000002.addEventListener('click', showNextPlacard0000002);
});




// ********NotDOMed**************Part 46 dropdown menu for tshirts


function showDropdownMenu(menuId) {
    document.getElementById(menuId).style.display = 'block';
    document.getElementById('dropdownMenuQuantity').style.display = 'block';
    document.getElementById('ShoppingCartForTshirtOn3SidedBillBoardsPlacard004').style.display = 'block';

    const dropdownMenuQuantity = document.getElementById('dropdownMenuQuantity');
    dropdownMenuQuantity.innerHTML = '<option disabled selected>How Many?</option>';
    for (let i = 1; i <= 99; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        dropdownMenuQuantity.appendChild(option);
    }
}


function logQuantityChoice(quantity) {
    console.log('Quantity chosen: ' + quantity);
}




function logChoice(type, color) {
    console.log(type + ' chosen: ' + color);
    // This will not hide the dropdowns since we need them to stay visible
}

function logSizeChoice(size) {
    console.log('Size chosen: ' + size);
    // This will not hide the dropdowns since we need them to stay visible
}


function logChoicesAndHideElements() {
    const size = document.getElementById('dropdownMenu24').value;
    const quantity = document.getElementById('dropdownMenuQuantity').value;

    console.log('Chosen size: ' + size);
    console.log('Chosen quantity: ' + quantity);

    document.getElementById('dropdownMenu24').style.display = 'none';
    document.getElementById('dropdownMenuQuantity').style.display = 'none';
    document.getElementById('ShoppingCartForTshirtOn3SidedBillBoardsPlacard004').style.display = 'none';
}









function showDropdownMenusCustom() {
    document.getElementById('dropdownContainerCustom').style.display = 'flex';
    document.getElementById('dropdownMenuHowMany').style.display = 'block';
    document.getElementById('ShoppingCartForCUSTOMTshirtOn3SidedBillBoardsPlacard004').style.display = 'block';

    const dropdownMenuHowMany = document.getElementById('dropdownMenuHowMany');
    dropdownMenuHowMany.innerHTML = '<option disabled selected>How Many?</option>';
    for (let i = 1; i <= 99; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        dropdownMenuHowMany.appendChild(option);
    }
}

function logChoiceForPlacard004sCustomTshirt(type, value) {
    console.log(type + ' chosen: ' + value);
}

function logSizeChoiceForPlacard004sCustomTshirt(size) {
    console.log('Size chosen: ' + size);
}

function logQuantityChoiceForPlacard004sCustomTshirt(quantity) {
    console.log('Quantity chosen: ' + quantity);
}

function logChoicesAndHideElementsForPlacard004sCustomTshirt() {
    const tshirtColor = document.getElementById('dropdownMenuLeft').value;
    const logoColor = document.getElementById('dropdownMenuCenter').value;
    const size = document.getElementById('dropdownMenuRight').value;
    const quantity = document.getElementById('dropdownMenuHowMany').value;

    console.log('Chosen TshirtColor: ' + tshirtColor);
    console.log('Chosen LogoColor: ' + logoColor);
    console.log('Chosen Size: ' + size);
    console.log('Chosen Quantity: ' + quantity);

    document.getElementById('dropdownMenuLeft').style.display = 'none';
    document.getElementById('dropdownMenuCenter').style.display = 'none';
    document.getElementById('dropdownMenuRight').style.display = 'none';
    document.getElementById('dropdownMenuHowMany').style.display = 'none';
    document.getElementById('ShoppingCartForCUSTOMTshirtOn3SidedBillBoardsPlacard004').style.display = 'none';
}

// ********NotDOMed**************Part 47


function showDropdownMenuForPlacard006(menuId) {
    document.getElementById(menuId).style.display = 'block';
    document.getElementById('dropdownMenuHowMany006').style.display = 'block';
    document.getElementById('ShoppingCartForBULKTshirtOn3SidedBillBoardsPlacard006').style.display = 'block';
}

function logChoiceForPlacard006(type, value) {
    console.log(type + ' chosen: ' + value);
}

function logChoicesAndHideElementsForPlacard006() {
    const size = document.getElementById('dropdownMenu200').value;
    const howMany = document.getElementById('dropdownMenuHowMany006').value;

    console.log('Chosen Size: ' + size);
    console.log('Chosen How Many: ' + howMany);

    document.getElementById('dropdownMenu200').style.display = 'none';
    document.getElementById('dropdownMenuHowMany006').style.display = 'none';
    document.getElementById('ShoppingCartForBULKTshirtOn3SidedBillBoardsPlacard006').style.display = 'none';
}

// ********NotDOMed**************Part 48 




// this code below is for data-sku=""

// Function to create and display toast messages
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000); // Display for 3 seconds

    setTimeout(() => {
        toast.remove();
    }, 3500); // Remove after fade-out
}

// Select all buttons with the shopping cart symbol
const addToCartButtons = document.querySelectorAll('button[data-sku]');

// Debounce function to manage multiple AJAX requests
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Function to handle add to cart logic
const handleAddToCart = debounce(async (sku) => {
    console.log(`Attempting to add SKU: ${sku} to cart`); // Log SKU being added
    try {
        const response = await fetch('/wp-json/custom/v1/add-to-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku }) // Send SKU in the request body
        });
        const text = await response.text(); // Get raw response text
        console.log('Raw response received:', text); // Log raw response
        try {
            const data = JSON.parse(text); // Parse it as JSON
            console.log('Parsed response:', data); // Log parsed response
            if (data.php_errors) {
                console.error('PHP Errors:', data.php_errors); // Log PHP errors
            }
            showToast(data.message); // Show success or error message as toast
        } catch (e) {
            console.error('Error parsing JSON:', text); // Log the raw response text
            showToast('Failed to parse response, but continuing processing.');
        }
    } catch (error) {
        console.error('Error:', error); // Log any errors that occur during submission
        showToast('Failed to add product to cart.');
    }
}, 200); // Debounce time in milliseconds

// Add click event listener to each button
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sku = button.getAttribute('data-sku'); // Get the SKU from the button
        console.log(`This ${sku} has been clicked`); // Console log to confirm button click
        handleAddToCart(sku); // Call the debounced function
    });
});



// this code above is for data-sku=""

// Select the button with the data-sku attribute
const button = document.querySelector('button[data-sku]');

// Add click event listener to the button
button.addEventListener('click', () => {
    const sku = button.getAttribute('data-sku'); // Get the SKU from the button

    // Console log to confirm button click
    console.log(`This ${sku} has been clicked`);
});




// ********NotDOMed**************Part 49 (Note:> This code here, is part of CELLPHONECODEXXXPart002of003 in where we make sure the click and hold to record button works for cellphones; if you change width, change for all CELLPHONECODEXXXPartXofY please) 


  if (window.innerWidth <= 775) {
    const recordButton = document.getElementById("recordButton");

    if (recordButton) {
      // Disable the default context menu (so the save image prompt doesn’t appear)
      recordButton.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
      
      // Set CSS properties to further disable native touch callouts and image dragging
      recordButton.style.webkitTouchCallout = "none"; // iOS Safari disables callout
      recordButton.style.webkitUserDrag = "none";       // Prevents default image drag behavior
      recordButton.style.userSelect = "none";           // Disables selection
      // Also prevent default touch actions
      recordButton.style.touchAction = "none"; 

      // Use pointer events for mobile devices to handle click & hold recording
      recordButton.addEventListener("pointerdown", (e) => {
        e.preventDefault();  // Prevent any default behaviors
        isMouseDown = true;
        startRecording();
        playGifs();
      });

      recordButton.addEventListener("pointerup", (e) => {
        e.preventDefault();
        isMouseDown = false;
        if (mediaRecorder) {
          mediaRecorder.stop();
          mediaRecorder.addEventListener("stop", handleRecordingStop);
        }
      });

      recordButton.addEventListener("pointerleave", (e) => {
        e.preventDefault();
        if (isMouseDown) {
          isMouseDown = false;
          if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        }
      });
    } else {
      console.error("Element with ID 'recordButton' not found.");
    }
  }

	
	
	// ********NotDOMed**************Part 50 (Note:> This code here, is part of CELLPHONECODEXXXPart003of003 in where we make sure all the buttons works for cellphones; if you change width, change for all CELLPHONECODEXXXPartXofY please) 


  if (window.innerWidth <= 775) {
    // Helper function that attaches the mobile-friendly pointer event fix.
    // It listens for pointerdown/up events, measures pointer movement to detect a tap,
    // dispatches a synthetic click if appropriate, and suppresses any duplicate native click quickly fired afterward.
    function attachMobileFix(element) {
      if (!element) return;

      // Bring the element to the front and optimize for touch.
      element.style.position = "relative";
      element.style.zIndex = "9999";
      element.style.touchAction = "manipulation";

      let pointerDownX = null;
      let pointerDownY = null;
      let lastPointerUpTs = 0; // Used to record the pointerup event time

      // Capturing click listener to block any native click event that fires too soon after our synthetic click.
      element.addEventListener(
        "click",
        function (e) {
          // If a native (trusted) click occurs within 300ms after our pointerup, block it.
          if (e.isTrusted && Date.now() - lastPointerUpTs < 300) {
            console.log("Blocking duplicate native click event on", element.id);
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        },
        true
      );

      element.addEventListener("pointerdown", function (e) {
        console.log(element.id + " pointerdown");
        e.preventDefault();
        e.stopPropagation();
        pointerDownX = e.clientX;
        pointerDownY = e.clientY;
      });

      element.addEventListener("pointerup", function (e) {
        console.log(element.id + " pointerup");
        e.preventDefault();
        e.stopPropagation();
        // Determine if the pointer moved slightly – if not, it's interpreted as a tap.
        const deltaX = Math.abs(e.clientX - pointerDownX);
        const deltaY = Math.abs(e.clientY - pointerDownY);
        if (deltaX < 10 && deltaY < 10) {
          lastPointerUpTs = Date.now(); // Record this pointerup time.
          console.log("Dispatching synthetic click event on", element.id);
          // Dispatch a synthetic click event to activate the element's attached click handlers.
          element.dispatchEvent(new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
          }));
        }
        pointerDownX = null;
        pointerDownY = null;
      });

      element.addEventListener("pointercancel", function () {
        pointerDownX = null;
        pointerDownY = null;
      });

      // Prevent long-press context menu (e.g. the "save image" prompt) on this element.
      element.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        console.log("Preventing contextmenu on", element.id);
      });
    }

    // List of element IDs that need the mobile click fix.
    // Adding "recordedAudio" to also fix the audio preview play button.
    const elementIds = ["submitMp3", "uploadMp3Btn", "uploadLogoBtn", "removeAudioBtn", "recordedAudio"];
    elementIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        attachMobileFix(el);
      } else {
        console.error("Element with ID '" + id + "' not found.");
      }
    });
  }
	
	
	// ********NotDOMed**************Part 51 This code below, is the code for: "turning the DATE for an Ad's Image01 section (ad of top right of uminion website) into a 'date that updates itself' -8:38pm(sh) on 5/5/25

    function updateEventDateForAd001() {
            const dateElementForAd001 = document.getElementById("dateForAd001");
            const todayForAd001 = new Date();

            let currentMonthForAd001 = todayForAd001.getMonth();
            let currentYearForAd001 = todayForAd001.getFullYear();

            // If it's the 25th or later, move to the next month
            if (todayForAd001.getDate() >= 25) {
                currentMonthForAd001 += 1;
                if (currentMonthForAd001 > 11) { // If December, move to next year
                    currentMonthForAd001 = 0;
                    currentYearForAd001 += 1;
                }
            }

            const monthNamesForAd001 = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const eventDateTextForAd001 = `${monthNamesForAd001[currentMonthForAd001]} 24th ${currentYearForAd001}`;

            dateElementForAd001.textContent = eventDateTextForAd001;
        }

        updateEventDateForAd001();


	// ********NotDOMed**************Part 52 This code below, is the code for: "turning the DATE for an Ad's Image01 section (ad of top right of uminion website) into a 'date that updates itself' -8:38pm(sh) on 5/5/25
	
    function updateEventDateForAd002() {
            const dateElementForAd002 = document.getElementById("dateForAd002");
            const todayForAd002 = new Date();

            let currentMonthForAd002 = todayForAd002.getMonth();
            let currentYearForAd002 = todayForAd002.getFullYear();

            // If it's the 25th or later, move to the next month
            if (todayForAd002.getDate() >= 25) {
                currentMonthForAd002 += 1;
                if (currentMonthForAd002 > 11) { // If December, move to next year
                    currentMonthForAd002 = 0;
                    currentYearForAd002 += 1;
                }
            }

            const monthShortNamesForAd002 = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            const eventDateTextForAd002 = `${monthShortNamesForAd002[currentMonthForAd002]} 24 (9am to 9pm) ${currentYearForAd002}`;

            dateElementForAd002.textContent = eventDateTextForAd002;
        }

        updateEventDateForAd002();


// ********NotDOMed**************Part 53 This code below, is the code for: 





</script>
</body>
</html>



