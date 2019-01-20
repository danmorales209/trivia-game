$(document).ready(function () {
     console.log(dataObject.data.length);

     $(".list-group-item-action").on("click", function() {
         alert($(this).attr("index"));
     });
    
})