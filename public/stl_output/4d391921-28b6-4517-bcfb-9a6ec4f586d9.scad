$fn = 100;
w = 50;
l = 50;
h = 50;
wall_thickness = 2;
lid_thickness = 4;
lid_clearance = 0;
rad = 1;

// Main box body
module outer_rec() {
    linear_extrude(height = h)
    offset(r=rad) offset(delta = -1*rad) square([w, l]);
}

module inner_rec() {
    linear_extrude(height = h)
    offset(r=rad) offset(delta = -1* rad) // round the corners
		square([w - (wall_thickness*2) , l - (wall_thickness*2) ]);
}
// Lid top
module top_l() {
    linear_extrude(height = lid_thickness/2)
    offset(r=rad) offset(delta = -1*rad) square([w, l]);
    translate([w*.5, l, 0])
    cube([10, 2, lid_thickness/2]);
}
// Lid bottom
module bottom_l() {
    difference() { // hollow out the lid bottom
        linear_extrude(height = lid_thickness/2)
        offset(r=rad) offset(delta = -1* rad) // round the corners
			square([(w - (wall_thickness*2))- lid_clearance , (l - (wall_thickness*2))-lid_clearance ]);
        translate([wall_thickness, wall_thickness, 0])
        linear_extrude(height = (lid_thickness/2)+1)
        offset(r=rad) offset(delta = -1* rad) square([(w - (wall_thickness*4)) , (l - (wall_thickness*4))]);
    }
}

// Hollow out the main box body
difference () {
outer_rec();
translate([wall_thickness,  wall_thickness, wall_thickness])
inner_rec();
}
// Create the lid and put it on the side
translate([w*1.1, 0, 0])
{
top_l();
translate([wall_thickness, wall_thickness, lid_thickness/2])
bottom_l();
}
