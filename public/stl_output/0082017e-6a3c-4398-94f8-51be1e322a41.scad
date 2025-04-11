w = 50 ;
l = 50 ;
h = 50 ;
wall_thickness = 2;

lid_thickness = 12;
lid_clearance = 0;

// Lid top
module top_l() {
    cube([w, l, lid_thickness/2]);
    translate([w*.5, l, 0])
    cube([10, 2, lid_thickness/2]); // this is the tab
}
// Lid bottom
module bottom_l() {
    difference() { // hollow out the lid bottom
        cube([(w - (wall_thickness*2))- lid_clearance , (l - (wall_thickness*2))-lid_clearance, lid_thickness/2 ]);
        translate([wall_thickness, wall_thickness, 0])
        cube([(w - (wall_thickness*4)) , (l - (wall_thickness*4)), (lid_thickness/2)+1]);
    }
}

difference() {
    // Outer box
    cube([w, l, h]);

    // Inner hollow space
    translate([wall_thickness, wall_thickness, wall_thickness])
        cube([
            w - 2 * wall_thickness,
            l - 2 * wall_thickness,
            h
        ]);
}

// Create the lid and put it on the side
translate([w*1.1, 0, 0])
{
top_l();
translate([wall_thickness, wall_thickness, lid_thickness/2])
bottom_l();
}
