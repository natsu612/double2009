AOS.init();

$(function() {
    var $scroll_data=_add_scroll($(".table1"),true);
   _scroll_effect($scroll_data);
   _add_fixed_table($(".table1"));
  
    var $scroll_data2=_add_scroll($(".table2"),true);
   _scroll_effect($scroll_data2);
   _add_fixed_table($(".table2"));
 
});

// 設置鎖定表格欄列
// ==============================================================
function _add_fixed_table($parents){
    var $top=false,$left=false,
        $data_string=$parents.find(".js-container").html(),
        $top_data=$($.parseHTML($data_string)),
        $left_data=$($.parseHTML($data_string)),
        $corner_data=$($.parseHTML($data_string)),
        $fixed_width=$parents.find(".js-container td:eq(0)").css("width");

  /* 鎖定上方表格列*/
    if($parents.find(".fixed-top").length==1){
        $top=true;
        $top_data.find("tr:gt(0)").remove();
        $parents.find(".fixed-top").html($top_data)
                       .width($parents.find(".js-container").width())
                       .height($parents.find("tr:gt(0)").height());
    }

   /* 鎖定左方表格欄*/
    if($parents.find(".fixed-left").length==1){
        $left=true;
        $left_data.find("td:not(td:nth-child(1)),th:gt(0)").remove();
        $parents.find(".fixed-left").html($left_data);
        $parents.find(".fixed-left table,.fixed-left").width($fixed_width);
    }

   /* 鎖定對角表格*/
    if($top && $left){
        $corner_data.find("tr:gt(0),th:gt(0)").remove();
        $parents.find(".fixed-corner").html($corner_data);
        $parents.find(".fixed-corner table,.fixed-corner").width($fixed_width)
                 .height($parents.find("tr:gt(0)").height());
    }
}


// 區塊卷軸
// ==============================================================
function _add_scroll($parents,$fixed){
    var $fixed_left,$fixed_top;
    //如有表格欄列需要一起捲動則取得鎖定表格資料，否則將變數設成false
    if($fixed){
        var $fixed_box=_table_fixed($parents);
        $fixed_left=$fixed_box["left"];
        $fixed_top=$fixed_box["top"];
    }
    else{
        $fixed=false;
        $fixed_left=false;
        $fixed_top=false;
    }
        //抓取顯示區塊寬高
    var $scrollbar = $parents.find(".js-scrollbar"),
        $container = $parents.find(".js-container"),
        $scrollbox = $parents.find(".js-scrollbox"),
        $scrollbar_h = $scrollbar.height(),
        $scrollbar_w = $scrollbar.width(),
        //抓取捲動內容區塊寬高
        $container_h = $container.height(),
        $container_w = $container.width(),
        //顯示區塊及內容區塊差距 比值變數
        $vertical_ratio,
        $horizontal_ratio,
        //插入垂直及橫向卷軸
        $scroll_string="<div class=\"scrollbar_horizontal\"><div class=\"js-dragger_rail\"><div class=\"js-dragger_bar\"></div></div></div><div class=\"scrollbar_vertical\"><div class=\"js-dragger_rail\"><div class=\"js-dragger_bar\"></div></div></div>";
    $scrollbox.html($scroll_string);
    //抓取插入的卷軸元素
        //垂直卷軸
    var $vertical=$parents.find(".scrollbar_vertical"),
        $vertical_rail=$parents.find(".scrollbar_vertical .js-dragger_rail"),
        $vertical_bar=$parents.find(".scrollbar_vertical .js-dragger_bar"),
        //橫向卷軸
        $horizontal=$parents.find(".scrollbar_horizontal"),
        $horizontal_rail=$parents.find(".scrollbar_horizontal .js-dragger_rail"),
        $horizontal_bar=$parents.find(".scrollbar_horizontal .js-dragger_bar");

    //計算比值，如內容區塊不足以捲動則=1(不可捲動)
    if($container_h > $scrollbar_h)
        $vertical_ratio = $scrollbar_h / $container_h;
    else $vertical_ratio=1;
    if($container_w > $scrollbar_w)
        $horizontal_ratio = $scrollbar_w / $container_w; //比值
    else $horizontal_ratio=1;

    //卷軸預設隱藏
    $vertical.hide();
    $horizontal.hide();
    //捲動軸高度=顯示區塊高度
    $vertical.height($scrollbar_h);
    $horizontal.width($scrollbar_w);
    //捲動紐長度計算
    $vertical_bar.height($scrollbar_h * $vertical_ratio);
    $horizontal_bar.width($scrollbar_w * $horizontal_ratio);
    //取得卷軸可以捲動的長度
    var $vertical_range = $scrollbar_h*(1-$vertical_ratio);
    var $horizontal_range =$scrollbar_w*(1-$horizontal_ratio);

    //返回json資料型態的變數
    var $data={"vertical":$vertical,
               "horizontal":$horizontal,
               "vertical_bar":$vertical_bar,
               "horizontal_bar":$horizontal_bar,
               "scrollbar":$scrollbar,
               "container":$container,
               "vertical_ratio":$vertical_ratio,
               "horizontal_ratio":$horizontal_ratio,
               "vertical_range":$vertical_range,
               "horizontal_range":$horizontal_range,
               "fixed_top":$fixed_top,
               "fixed_left":$fixed_left};
    return $data;
}

function _table_fixed($parents){
  var $top=$parents.find(".fixed-top"),
      $left=$parents.find(".fixed-left"),
      $fixed={"top":$top,"left":$left};
  return $fixed;
}

function _scroll_effect($data) {
  var $win = $(window);

  //將json資料裝進變數裡
  var $vertical=$data["vertical"],
      $horizontal=$data["horizontal"],
      $vertical_bar=$data["vertical_bar"],
      $horizontal_bar=$data["horizontal_bar"],
      $scrollbar=$data["scrollbar"],
      $container=$data["container"],
      $vertical_ratio=$data["vertical_ratio"],
      $horizontal_ratio=$data["horizontal_ratio"],
      $vertical_range=$data["vertical_range"],
      $horizontal_range=$data["horizontal_range"],
      $fixed_top=$data["fixed_top"],
      $fixed_left=$data["fixed_left"];

$vertical_bar.css("top",0);
$horizontal_bar.css("left",0);
$container.css("top",0).css("left",0);
if($fixed_top!=$fixed_left){
    $fixed_top.css("left",0);
    $fixed_left.css("top",0);
}
  //拖曳滾軸捲動內容效果
        //按著滑鼠為true，反則為fales
    var $drag = false,
        //鼠標在顯示區塊內為true，在顯示區塊外為false
        $inside =false;

    //橫向卷軸點及拖曳事件
    $scrollbar.on('mousedown',".scrollbar_horizontal .js-dragger_bar", function(e) {
        //按下滑鼠將判斷開關開啟
        $drag = true;
            //取得目前捲動鈕的位置
        var $bar_left = parseInt($horizontal_bar.css("left")),
            //按下按鈕的位置-原本捲動軸頭部的位置
            $datum = e.pageX - $bar_left;

        $win.on('mousemove', function(e) {
          //捲動軸頭部位置=拖曳的距離=拖曳改變的數值+原本的位置
          var $left = e.pageX - $datum;

          if ($left < 0) $left = 0;
          if ($left > $horizontal_range) $left = $horizontal_range;
          $horizontal_bar.css("left", $left);
          _container_horizontal_move($left,$horizontal_ratio,$container,$fixed_top);
        });
        return false;
    });

    //滑屬拖曳滾軸事件
    $scrollbar.on('mousedown',".scrollbar_vertical .js-dragger_bar", function(e) {
        var $bar_top = parseInt($vertical_bar.css("top")),
        $datum = e.pageY - $bar_top;
        $drag = true;

        $win.on('mousemove', function(e) {
            var $top = e.pageY - $datum;

            if ($top < 0) $top = 0;
            if ($top > $vertical_range) $top = $vertical_range;
            $vertical_bar.css("top", $top);
            _container_vertical_move($top,$vertical_ratio,$container,$fixed_left);
        });
        return false;
    });
    $win.on('mouseup', function() {
        if ($drag) {
            $drag = false;
            if(!$inside){
              $vertical.fadeOut(300);
              $horizontal.fadeOut(300);
            }
            $win.off('mousemove');
        }
    });

    //卷軸淡出
    $scrollbar.on('mouseenter', function() {
        $inside=true;

        $vertical.fadeIn(300);
        $horizontal.fadeIn(300);
        return false;
    });
    //卷軸淡入
    $scrollbar.on('mouseleave', function() {
        $inside=false;
        if (!$drag){
          $vertical.fadeOut(300);
          $horizontal.fadeOut(300);
        }
    });

    //滑鼠滾動事件
    var $speed = 0;
    $scrollbar.on('mousewheel', function(e) {
        $speed += -e.deltaY*34;
        if ($speed < 0) $speed = 0;
        if ($speed > $vertical_range) $speed = $vertical_range;
        $vertical_bar.stop().animate({
            top: $speed
        }, 500);
        _container_vertical_move($speed,$vertical_ratio,$container,$fixed_left);
        return false;
    });
}



function _container_vertical_move($top,$ratio,$container,$fixed_left) {
    var $container_top = -$top / $ratio;
    $container.stop().animate({
        top: $container_top,
    }, 100);
    if($fixed_left){
        $fixed_left.stop().animate({
            top: $container_top,
        }, 100);
    }
}

function _container_horizontal_move($left,$ratio,$container,$fixed_top) {
    var $container_left = -$left / $ratio;
    $container.stop().animate({
        left: $container_left,
    }, 100);
    if($fixed_top){
        $fixed_top.stop().animate({
            left: $container_left,
        },100);
    }
}