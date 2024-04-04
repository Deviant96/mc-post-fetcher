let mcSlideIndex = 0;
let mcSlideMaxHeight = 0;

function showSlides() {
  let slideContainer = document.querySelector('.mc-slideshow');
  let slides = document.querySelectorAll('.mc-slide');
  if (mcSlideIndex >= slides.length) {
    mcSlideIndex = 0;
  }
  if (mcSlideIndex < 0) {
    mcSlideIndex = slides.length - 1;
  }

  if (mcSlideTransitionStyle === 'slide') {
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.transform = 'translateX(' + (-mcSlideIndex * 100) + '%)';
    }
  } else if (mcSlideTransitionStyle === 'fade') {
    slideContainer.style.display = 'block';
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.position = 'absolute';
      slides[i].style.transition = 'opacity 0.5s ease';
      slides[i].style.width = '100%';


      let slideHeight = slides[i].offsetHeight;
      if (slideHeight > mcSlideMaxHeight) {
        mcSlideMaxHeight = slideHeight;
      }

      if (i === mcSlideIndex) {
        slides[i].style.opacity = 1;
      } else {
        slides[i].style.opacity = 0;
      }
    }
    document.querySelector('.mc-slideshow').style.height = mcSlideMaxHeight + 'px';
  } else if (mcSlideTransitionStyle === 'slide-vertical') {
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.transform = 'translateY(' + (-mcSlideIndex * 100) + '%)';
    }
  }
}

function autoSlides() {
  changeSlide(1);

  if (mcSlideAutoSlideEnabled) {
    setTimeout(autoSlides, mcSlideAutoSlideDelay);
  }
}

function toggleAutoSlide() {
  mcSlideAutoSlideEnabled = !mcSlideAutoSlideEnabled;
  if (mcSlideAutoSlideEnabled) {
    autoSlides();
  }
}

function changeSlide(n) {
  mcSlideIndex += n;
  showSlides();
}


document.addEventListener('DOMContentLoaded', function () {
  showSlides();
  autoSlides();

  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 37) {
      changeSlide(-1);
    } else if (e.keyCode === 39) {
      changeSlide(1);
    }
  });

  let startX;

  document.querySelector('.wp-block-mc-custom-block-mc-post-fetcher').addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  });

  document.querySelector('.wp-block-mc-custom-block-mc-post-fetcher').addEventListener('touchend', function (e) {
    let endX = e.changedTouches[0].clientX;
    let diff = startX - endX;
    if (diff > 50) {
      changeSlide(1);
    } else if (diff < -50) {
      changeSlide(-1);
    }
  });
});