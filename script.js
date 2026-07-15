// ----------------------------
// StudentHub Portal
// script.js
// ----------------------------

// Login Form

const loginForm = document.querySelector("form");

if (loginForm && document.title.includes("Login")) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        alert("Login Successful!");

        window.location.href = "dashboard.html";

    });

}



// Signup Form

if (loginForm && document.title.includes("Sign Up")) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        alert("Account Created Successfully!");

        window.location.href = "login.html";

    });

}



// Buttons Animation

const buttons = document.querySelectorAll(".btn");

buttons.forEach(function(button){

    button.addEventListener("mouseover",function(){

        button.style.transform="scale(1.05)";

    });

    button.addEventListener("mouseout",function(){

        button.style.transform="scale(1)";

    });

});



// Highlight Active Sidebar Link

const links=document.querySelectorAll(".sidebar a");

links.forEach(function(link){

    link.addEventListener("click",function(){

        links.forEach(function(item){

            item.classList.remove("active");

        });

        this.classList.add("active");

    });

});



// Dashboard Greeting

const heading=document.querySelector(".topbar h3");

if(heading){

    let hour=new Date().getHours();

    let msg="";

    if(hour<12){

        msg="Good Morning 👋";

    }

    else if(hour<18){

        msg="Good Afternoon 👋";

    }

    else{

        msg="Good Evening 👋";

    }

    heading.innerHTML=msg;

}



// Simple Card Hover

const cards=document.querySelectorAll(".card");

cards.forEach(function(card){

    card.addEventListener("mouseenter",function(){

        card.style.transform="translateY(-6px)";

    });

    card.addEventListener("mouseleave",function(){

        card.style.transform="translateY(0px)";

    });

});



// Download Receipt Button

const downloadBtn=document.querySelector(".btn");

if(downloadBtn){

    downloadBtn.addEventListener("click",function(){

        console.log("Button Clicked");

    });

}