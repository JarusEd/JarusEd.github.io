
// This javascript code [weatherscript.js] has been developed as an assignment for FlecksLabs Gaming Studio job
// Developed by: Suraj De

var email = "";
var password = "";
var username = "";

// The function for login form.

function loginfunc() {   

    class Login {
        constructor(form, fields){
            this.form = form;
            this.fields = fields;
            this.extractUserandPass();
        }

        extractUserandPass(){
            let self = this;

            this.form.addEventListener("submit", (e) => {
                e.preventDefault();
                self.fields.forEach((field) => {
                    const input = document.querySelector(`#${field}`);
                    if(field == "email")
                    {
                        email = input.value;
                    }
                    else
                    {
                        password = input.value;
                    }
                    if(email != "" && password != "")
                    {
                        document.getElementById("resultOutput").innerHTML = "Logging In . . . . !"; 
                        username = document.querySelector("#username").value
                        this.DoExampleLoginWithEmailAddress();
                    }
                });
            });
        }

        DoExampleLoginWithEmailAddress(){ // This function is for calling "LoginWithEmailAddress" API from PlayFab
    
            PlayFab.settings.titleId = document.getElementById("titleId").value; 
                    
            var loginRequest = {
                Email: email,
                Password: password,
                TitleId: PlayFab.settings.titleId
            };
                    
            PlayFabClientSDK.LoginWithEmailAddress(loginRequest, LoginCallback);  // PlayFabAPI request for login by email and password
        }
    }

    var LoginCallback = function (result, error) {

        if (result !== null) {
            document.getElementById("resultOutput").innerHTML = "Logged In!";

            localStorage.setItem('SessionTicket', result.data.SessionTicket);
            localStorage.setItem('PlayFabId', result.data.PlayFabId);

            // Following code block switches the visibility of the pages
            document.querySelector(".center2").style.display = "block"; 
            document.querySelector(".center1").style.display = "none";

        } else if (error !== null) {
            console.log(error.errorCode);
            if(error.errorCode == 1001 && username != "")
            {
                var registerRequest = { Email: email, Password: password, Username: username };
                PlayFabClientSDK.RegisterPlayFabUser(registerRequest, OnRegisterSuccess, OnRegisterFailure);
            }
            else
            {
                document.getElementById("resultOutput").innerHTML = "Login Failed! (" + PlayFab.GenerateErrorReport(error) + ")";
            }
        }
    }

    var OnRegisterSuccess = function (result)  {
        document.getElementById("resultOutput").innerHTML = "Congratulations, you have been registered as a new player!";
    }

    var OnRegisterFailure = function (error) {
        document.getElementById("resultOutput").innerHTML = "Something went wrong with your registration.\n" +
                "Here's some debug information:\n" + PlayFab.GenerateErrorReport(error);
    }

    const form = document.querySelector(".loginForm");
    if (form){
        const fields = ["email", "password"];
        const validator = new Login(form, fields);
    }
}

var x = document.getElementById("tempDet");

function getLocation() {
    console.log(navigator.geolocation.getCurrentPosition);
    if (navigator.geolocation) {
        console.log("is it there?")
        navigator.geolocation.getCurrentPosition(showPosition, errorloc, options);
    } else {
        console.log("is it here?");
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function errorloc(err) {
    console.log(`ERROR(${err.code}): ${err.message}`);
    if(err.code == 1)
    {
        x.innerHTML = "You have denied geolocation. &#13;&#10;Kindly provide permission for detecting location."
    }

}

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

function showPosition(position) {

  var apiKey = '6717d328f8d34cc096d74600231206';
  var url = 'https://api.weatherapi.com/v1';

  latitude = position.coords.latitude;
  longitude = position.coords.longitude;

  console.log(url + "/current.json?key="+ apiKey + "&q=" + latitude + "," + longitude + "&aqi=no");

  $.getJSON(url + "/current.json?key="+ apiKey + "&q=" + latitude + "," + longitude + "&aqi=no", function(data) {

    var DataRequest = {
        Data: {
            ['Weather at ' + data.location.localtime]:'Location is: ' + data.location.name + ', ' + data.location.region + ', ' + data.location.country + '; ' 
            + 'Current Temperature is: ' + data.current.temp_c + '° C' + '; ' + 'Weather: ' + data.current.condition.text}
    };

    PlayFabClientSDK.UpdateUserData(DataRequest, DataCallback);

    x.innerHTML = '&#13;&#10;Location is: ' + data.location.name + ', ' + data.location.region + ', ' + data.location.country + '&#13;&#10;' 
    + 'Current Temperature is: ' + data.current.temp_c + '° C' + '&#13;&#10;' + 'Weather: ' + data.current.condition.text;
  });
}

var DataCallback = function (result, error) {
    console.log(result);
    if (result !== null) {
        console.log("Successful");
    } else if (error !== null) {
        console.log(error.code);
        switch(error.code) 
        {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
        }
        console.log("Something went wrong with your first API call.\n" + "Here's some debug information:\n" + PlayFab.GenerateErrorReport(error));
    }
}

function getSessionTicket(){
    var value = localStorage.getItem('SessionTicket');
    console.log(value);
    var output = document.getElementById('histDet');
    output.innerText = value;
}

function loggingout(){
    location.reload("weather.html");
    localStorage.clear();
    document.querySelector(".center2").style.display = "none";
    document.querySelector(".center1").style.display = "block";
}

function getDataHistory(){
    var DataHistRequest = {
        Keys: [],
        PlayFabId: localStorage.getItem('PlayFabId')
    }

    PlayFabClientSDK.GetUserData(DataHistRequest, DataHistCallback);
}

var DataHistCallback = function (result, error) {
    console.log(result);
    if (result !== null) {

        var resultDataKeys = Object.keys(result.data.Data);
        var resultDataValues = Object.values(result.data.Data);
        var innerValues = Object.values(resultDataValues);
        
        var history = document.getElementById("histDet");
        history.innerHTML = "";

        innerValues.forEach((innerValue, index)=>{
            var keyVal = resultDataKeys[index];
            var inValue = innerValue.Value;

            history.innerHTML += (index+1) + " -> " + keyVal + ": " + inValue + "&#13;&#10;&#13;&#10;";
        });

    } else if (error !== null) {
        console.log("Something went wrong with your first API call.\n" + "Here's some debug information:\n" + PlayFab.GenerateErrorReport(error));
    }
}

function getDeveloper(){
    var devDisp = document.getElementById("devDisplay");
    devDisp.innerHTML = "Developed by: suraj.de31@gmail.com [Suraj De]";
}