(function (window, document, $) {
    $('#menu').click(function () {
        $('.left-nav-wrapper').toggleClass('open');
    })
    $('#menu-1').click(function () {
        $('.right-nav-wrapper').toggleClass('open');
    })
//shouldHideSidebar();
})(window, document, jQuery);
