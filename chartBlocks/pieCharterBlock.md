
Reuters.Graphics.topdonut = new Reuters.Graphics.donut({
    el: "#reutersGraphic-chart1",
    dataURL:"data/data.csv",
    height:600,
    colorRange:[red4,lime4,rose4,tangerine4,green5,grey2,grey2,orange4,grey2,navy4,grey2],
    colorDomain:["Socialist Party","GreenLeft","Labour Party","Democrats 66","Christian Democratic Appeal","50PLUS","ChristianUnion - Reformed Political Party","People's Party for Freedom and Democracy","Political Reformed Party","Party for Freedom","Party for the Animals"], // array of values (or will auto pull based on color value
    plotValue:"seats",
    colorValue:"party_name_english",
    multiArcs:"year",
    multiSort:["2012","2010","2006"],
    //upsideDown:true,
    //wholePie:true,
    //startAngle:90,
    //endAngle:90,
    donutHoleSize:4,
    hasLegend:true,
    //tooltipTemplate:Reuters.Graphics.Template.pietooltip, 
	//setupTemplate:Reuters.Graphics.Template.piesetup,
       
});