(function (window, document, $) {
    // $('[data-toggle="popover"]').popover()  //Popover default

    $("[data-toggle=popover]").each(function(i, obj) {

        $(this).popover({
            html: true,
            content: function() {
                var id = $(this).attr('id')
                return $('#popover-content-' + id).html();
            }
        });
    });
    $('#notifiction').on('show.bs.popover', function () {
        $(this).parentsUntil("body").find('.popover.show').addClass('ss');
    })

    $('#menu').click(function () {
        $('.left-nav-wrapper').toggleClass('open');
    })
    $('.header-with-nav .header-nav .nav-link').click(function () {
        $('.header-with-nav .header-nav .nav-link').removeClass('active');
        // $(".tab").addClass("active"); // instead of this do the below
        $(this).addClass('active');
    });

    /****** Small Sidebar ******/
    // Wire the sidebar examples
    $('.small-sidebar-drawer > a').click(function () {
        $(this).parent().toggleClass('small-sidebar-drawer-opened');
    });

    // Wire the sidebar selected item
    $('.small-sidebar-item > a').click(function () {
        $('.small-sidebar-item').removeClass('small-sidebar-item-selected');
        $(this).parent().addClass('small-sidebar-item-selected');
    });

    /****** Regular Sidebar ******/
    // Wire the sidebar drawer open/close toggles
    $('.sidebar-drawer > a').click(function () {
        $(this).parent().toggleClass('sidebar-drawer-opened');
    });
    // Wire the sidebar selected item
    $('.sidebar-item > a').click(function () {
        $('.sidebar-item').removeClass('sidebar-item-selected');
        $(this).parent().addClass('sidebar-item-selected');
    });


    // Listen of window changes and close the sidebar if necessary
    $(window).resize(function () {
        //shouldHideSidebar();
    });
//shouldHideSidebar();
})(window, document, jQuery);
