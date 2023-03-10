//preloder script-----------------------------------
const loader = document.querySelector(".preloader-container");
    window.addEventListener("load",()=>{
      loader.classList.add("deactive");
    });

//navbar script --------------------------------------------------------------
const backHolder = document.querySelector(".backAnimation");
function heartCreator() {
  const heartHolder = document.createElement("div");
  heartHolder.classList.add("heart");
  let emojiContainer = ["<html>", "@import", '<style>', "<script>", "💕", "/* */", "//", "{}", "<></>","<?php ?>"];
  heartHolder.textContent = emojiContainer[Math.floor(Math.random() * (emojiContainer.length))];
  backHolder.appendChild(heartHolder);
  heartHolder.style.left = Math.random() * 100 + 'vw';
  heartHolder.style.animationDuration = Math.random() * 3 + 3 + 's';
  heartHolder.style.scale = Math.random() * 2;
  setTimeout(() => {
    backHolder.removeChild(heartHolder);
  }, 3000);

  let hexStringCode = "0123456789abcdef";
  let ColorCode = "#";
  for (let i = 0; i < 6; i++) {
    ColorCode += hexStringCode[Math.floor(Math.random() * hexStringCode.length)];
  }
  heartHolder.style.color = ColorCode;
}
heartCreator();
setInterval(heartCreator, 500);
//all body script -----------------------------


const navBar = document.querySelector(".navbar"),
cardSlider = document.querySelector(".carousel"),
navIcon = document.querySelector(".bar-icon"),
toggleNav = document.querySelector(".navbar .navbar-nav"),
closeNav = document.querySelector(".navbar-nav .close-btn"),
barIcon = document.querySelector(".navbar .bar-icon"),
scrollBtn = document.querySelector(".scroll-top"),
scrolledNav = document.querySelector(".navbar #scrollLenth");

var typed = new Typed(".home .home-content .text-3 span",{
  strings : ['Freelancer','Full-Stack Developer','Digital editor'],
  typeSpeed: 60,
  backSpeed: 130,
  loop : true
});
var typed = new Typed(".about .about-content .right .text span",{
  strings : ['Freelancer','Full-Stack Developer','Digital editor',"BSc.CSIT Sutdent"],
  typeSpeed: 150,
  backSpeed: 150,
  loop : true
});
let totalScrollHeight = document.body.scrollHeight - window.innerHeight;
window.addEventListener("resize", () => {
  totalScrollHeight = document.body.scrollHeight - window.innerHeight;
});
window.addEventListener('scroll', () => {
  let scroLL = this.scrollY;
  if (scroLL > 20) {
    navBar.classList.add("sticky");
    scrollBtn.classList.add("active");
    document.querySelector(".dark-mode-btn").classList.add("active");
    scrolledNav.classList.add("active");
  } else {
    navBar.classList.remove("sticky");
    document.querySelector(".dark-mode-btn").classList.remove("active");
    scrollBtn.classList.remove("active");
    scrolledNav.classList.remove("active");
  }
 let progress = (window.pageYOffset / totalScrollHeight) *  99.5;
 scrolledNav.style.width = progress+"%";
});
window.onload=()=>{
  if(scrollY>20) {navBar.classList.add("sticky");}
 }
scrollBtn.onclick = ()=>{
  document.body.scrollTop = 0;
  document.documentElement.scrollTop=0;
}
document.querySelector(".logo").onclick = ()=>{
  document.body.scrollTop = 0;
  document.documentElement.scrollTop=0;
}
document.addEventListener("click",(event)=>{
  if(!toggleNav.contains(event.target) && !barIcon.contains(event.target))
  {
    toggleNav.classList.remove("active");
    barIcon.classList.remove("deactive");
  }
});
navIcon.onclick = () =>{
  toggleNav.classList.add("active");
  barIcon.classList.add("deactive");
}
closeNav.onclick = ()=>{
  toggleNav.classList.remove("active");
  barIcon.classList.remove("deactive");
}

const hireButton = document.querySelector(".home .home-content a");
hireButton.href = `mailto:darpand263@gmail.com?&subject=Hiring as a employee&body=Hello,Darpan Adhikari. \n I want to hire you as a ....... \n In my company .... \n Company name:.....`;



// paragraph writter script----------------------------------

// const paraGraph = document.querySelectorAll(".about p").forEach(fontOf => {
//   var i = 10;
//   var txt = fontOf.textContent;
//   var speed = 5;
//   fontOf.textContent = "";

//   function typeWriter() {
//     if (i < txt.length) {
//       fontOf.textContent += txt.charAt(i);
//       i++;
//       setTimeout(typeWriter, speed);
//     }
//   }
//   typeWriter();
// });


//contact form script-------------------------------------------------------------------------

const nameInput = document.querySelector(".contact .right .name input"),
subjectInput = document.querySelector(".contact .right .subject input"),
messageInput = document.querySelector(".contact .right .message textarea"),
messageSend = document.querySelector(".contact .right .submit-btn button"),
checkBox = document.querySelector("#check-box");
checkBox.onclick = ()=>{
    nameInput.classList.remove("invalid");
    subjectInput.classList.remove("invalid");
    messageInput.classList.remove("invalid");
  if((messageInput.value != "")&&(nameInput.value != "")&&(subjectInput.value != "")){
    const mailInfo = `mailto:darpand263@gmail.com?&subject=${subjectInput.value}&body=My Name is ${nameInput.value},
    ${messageInput.value}`;
    messageSend.addEventListener("click",()=>{
      let anchorTag = document.createElement("a");
			document.body.appendChild(anchorTag);
      anchorTag.href = mailInfo;
      anchorTag.target = "_blank";
      anchorTag.click();
    });
  }else{
    if(nameInput.value == ""){
      nameInput.classList.add("invalid");
      nameInput.setAttribute("placeholder","Name field should not empty..");
    checkBox.checked = false;
    }else if(subjectInput.value == ""){
      subjectInput.classList.add("invalid");
      subjectInput.setAttribute("placeholder","Subject field should not empty..");
    checkBox.checked = false;
    }else if(messageInput.value == ""){
      messageInput.classList.add("invalid");
      messageInput.setAttribute("placeholder","Message field should not empty..");
    checkBox.checked = false;
    }
  }
  if(checkBox.checked){
    document.querySelector(".contact .right .checkbox label").classList.add("checked");
  }else{
    document.querySelector(".contact .right .checkbox label").classList.remove("checked");
  }
}
 var mytext = document.getElementById('message');
    var result = document.getElementById('count');
    result.textContent = 0;
    mytext.addEventListener('input',function(){
        var textlength = mytext.value.length;
        result.textContent = textlength;
    });


const cards = document.querySelectorAll(".card"),
 columns = document.querySelectorAll(".column")

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    entry.target.classList.toggle("active", entry.isIntersecting)
    if(entry.isIntersecting) observer.unobserve(entry.target);
  })
},
{
  threshold:0.5,
})
cards.forEach(card =>{
  observer.observe(card);
})
columns.forEach(column =>{
  observer.observe(column);
});

// card slider script-----------------------------------------------------------------------------

const carousel = document.querySelector(".projects .carousel"),
   projectCards = document.querySelectorAll(".projects .carousel .card"),
    buttonPrev = document.querySelector(".projects .carousel-btn span.prev"),
    buttonNext = document.querySelector(".projects .carousel-btn span.next");

    let cardSize = projectCards[0].clientWidth;
    let cardCount = projectCards.length;
    let carouselLength = carousel.clientWidth;
    let carouselEnd = carousel.offsetWidth;
    let scrollPosition =  carousel.scrollLeft;
    let mobile_view = window.matchMedia("(max-width: 785px)");
    if(mobile_view.matches){
     cardSize = projectCards[0].clientWidth;
    }
    buttonNext.onclick=()=>{  
      carousel.scrollLeft += cardSize;
     }
  buttonPrev.onclick=()=>{
    carousel.scrollLeft -= cardSize;
   } 
 window.onload=()=>{
  var opacity = 0;
  i = 0.25;
  let scrollButton = document.querySelector(".projects .carousel-btn");
  setInterval(()=>{   
    if(scrollButton.style.opacity > "0") {
    scrollButton.style.opacity = "1" - i;
    i=i+i;}else{
      scrollButton.style.opacity = "0" + i;
    }
    scrollButton.classList.toggle("active");
 },1500);
}
 
carousel.addEventListener("wheel",(evt)=>{
  evt.preventDefault();
  carousel.scrollLeft += evt.deltaY+20;
});
 // image carousel script------------------------------------------------------------------------------------
   
const mainImage = document.querySelector(".popup-carousel .main-img img"),
slideBtn = document.querySelectorAll(".popup-carousel .nav-item .drp"),
ImgConClose = document.querySelector(".popup-carousel .drp.close"),
slideCheckBox = document.querySelector(".popup-carousel #slideCheckBox"),
subImages = document.querySelectorAll(".popup-carousel .sub-img img"),
closePopup = document.querySelector(".popup-carousel-close"),
fetchImg = document.querySelectorAll(".projects .carousel .card img");
let imageNo = subImages.length;

fetchImg.forEach(img => {
  img.onmouseover=()=>{
    let fetched = img.getAttribute("src");
    for (var i = 0; i < imageNo - 1; i++) {
      if (fetched === subImages[i].getAttribute("src")) {
        subImages[i].click();
        counter = i;
      }
    }
  }
});
fetchImg.forEach(imag => {
  imag.onclick=()=>{
    let fetched = imag.getAttribute("src");
    for (var i = 0; i < imageNo - 1; i++) {
      if (fetched === subImages[i].getAttribute("src")) {
        subImages[i].click();
        counter = i;
      }
    }
    document.querySelector(".popup-carousel").classList.add("active");
  }
});
document.querySelectorAll(".imageHover").forEach(imageHover=>{
  imageHover.onclick=()=>{
    document.querySelector(".popup-carousel").classList.add("active");
  }
});
document.querySelectorAll(".projects .carousel .card .box p").forEach(desc=>{
  desc.onclick=()=>{
    document.querySelector(".popup-carousel").classList.add("active");
  }
});

closePopup.onclick=()=>{
  document.querySelector(".popup-carousel").classList.remove("active");
	clearInterval(interval);
}
slideBtn[3].onclick=()=>{
  document.querySelector(".popup-carousel .image-container .sub-img").classList.add("active");
}
ImgConClose.onclick=()=>{
  document.querySelector(".popup-carousel .image-container .sub-img").classList.remove("active");
}

subImages.forEach(image=>{
  image.onclick=()=>{
    let update = image.getAttribute("src");
     mainImage.setAttribute("src",update);
     image.classList.add("active");
     mainImage.classList.add("zoom");
     setTimeout(()=>{
      image.classList.remove("active");
      mainImage.classList.remove("zoom");
     },1500);
  }
});
var counter = 0;
slideBtn[2].onclick=()=>{
    if(counter >= imageNo-1){
      counter = 0;
      subImages[counter].click();

    } else{
      counter++;
      subImages[counter].click();
    }
}
slideBtn[0].onclick = () => {
  if(counter <= 0){
    counter = imageNo-1;
    subImages[counter].click();
  }else{
    counter--;
    subImages[counter].click();
  }
}
slideBtn[1].onclick = () => {
  slideCheckBox.click();
}

  var interval;
slideCheckBox.onclick=()=>{
  if(slideCheckBox.checked){
     interval = setInterval(()=>{
      slideBtn[2].click();
     },2000);
    }else{
      clearInterval(interval);
    }
  }
   
   
window.oncontextmenu = () => {
  return false;
}
document.body.addEventListener('keydown', event => {
  if (event.ctrlKey && 'us'.indexOf(event.key) !== -1) {
    event.preventDefault();
  }
});
 
 
//     document.addEventListener("visibilitychange",()=>{
//       if(document.visibilityState == "visible"){
//         document.title = "Darpan Adhikari || Developer";
//       }else{
//         document.title = "Open me..";
//       }   
//     });
    
    window.addEventListener("offline",()=>{
     setTimeout(()=>{
      document.querySelector(".bottom-network-check").classList.remove("active");
     },5000)
     document.querySelector(".bottom-network-check").classList.add("active");
     document.querySelector(".bottom-network-check").textContent = "you are offline!!😥";
     document.querySelector(".bottom-network-check").style.background ="red";
  });
  window.addEventListener("online",()=>{
    setTimeout(()=>{
      document.querySelector(".bottom-network-check").classList.remove("active");
     },5000)
     document.querySelector(".bottom-network-check").classList.add("active");
     document.querySelector(".bottom-network-check").textContent = "Back to online🥰";
     document.querySelector(".bottom-network-check").style.background ="green";
  });
 
const date = new Date();
document.getElementById("date").textContent = date.getFullYear();

window.addEventListener("load",()=>{
  document.querySelector(".greeting-field").classList.add("active");
  setTimeout(()=>{
    document.querySelector(".greeting-field").classList.remove("active");
    document.querySelector(".greeting-field").style.display = "none";
  },3000);
});
     const greet = ["Good Morning 🙏","Good Afternoon 🙏","Good Evening 🙏","Good wishes for your dream 🙏"];
    const thisTime = new Date().getHours();

    let greetIng = thisTime <= 12 && thisTime >= 0 ? 0 : thisTime >= 12 && thisTime <= 17 ? 1 : thisTime >=17 && thisTime <= 21 ? 2 : thisTime >= 21 && thisTime <=23.99 ? 3 : 0;
    document.querySelector(".greeting-field").textContent = greet[greetIng];


//dark mode switcher script ----------------------------------------------------------------------------------

const darkModeBtn = document.querySelector(".dark-mode-btn i");
const everySection = document.querySelectorAll("section");

let darkMode = localStorage.getItem("dark-mode");
const enableDarkMode = () => {
  everySection.forEach(eachSection => {
    eachSection.classList.add("dark-mode");
  });
  darkModeBtn.className = "fa fa-moon";
  localStorage.setItem("dark-mode", "enabled");
};

const disableDarkMode = () => {
  everySection.forEach(eachSection => {
    eachSection.classList.remove("dark-mode");
  });
  darkModeBtn.className = "fa fa-sun";
  localStorage.setItem("dark-mode", "disabled");
};

if (darkMode === "enabled") {
  enableDarkMode();
}

darkModeBtn.addEventListener("click", (e) => {
  darkMode = localStorage.getItem("dark-mode");
  if (darkMode === "disabled") {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
});

// timer script-----------------------------------------------------
   const hours = document.querySelector(".hours"),
    minutes =  document.querySelector(".minutes"),
    second =  document.querySelector(".second");
    setInterval(()=>{
      var clockDate = new Date();
      hr = clockDate.getHours();
      min = clockDate.getMinutes();
      sec = clockDate.getSeconds();
      if(hr < 10) {hr = "0"+hr;}
      if(min < 10) {min = "0"+min;}
      if(sec < 10) {sec = "0"+sec;}
    
      hours.textContent = hr;
      minutes.textContent = min;
      second.textContent = sec;
    }); 


// greeting via voice--------------
var msgCount = 0;
window.addEventListener('mouseover', () => {
  speak();
});
window.addEventListener('mousemove', () => {
  speak();
});
window.addEventListener('wheel', () => {
  speak();
});
window.addEventListener('load', () => {
  speak();
});
window.addEventListener('touchstart', () => {
  speak();
});
function speak(){
  if (msgCount < 1) {
    if (speechSynthesis.speaking !== true) {
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = `${greet[greetIng].slice(0, -1)}Friend, I'm Darpan Adhikari and welcome to my portfolio`;
        msg.lang = "hi-IN";
        window.speechSynthesis.speak(msg);
      }
      if(speechSynthesis.speaking === true) {
        msgCount += 1;
      }
    } else {
      msgCount += 1;
    }
  }
}
