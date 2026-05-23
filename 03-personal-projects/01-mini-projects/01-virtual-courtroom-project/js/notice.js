// 상단 탭 active
    const tabs = document.querySelectorAll(".tab");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {

        tabs.forEach(item => {
          item.classList.remove("active");
        });

        tab.classList.add("active");
      });
    });


    // 카테고리 active
    const categories = document.querySelectorAll(".category");

    categories.forEach(category => {

      category.addEventListener("click", () => {

        categories.forEach(item => {
          item.classList.remove("active");
        });

        category.classList.add("active");

      });

    });
