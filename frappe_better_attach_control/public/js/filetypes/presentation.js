/*
*  Frappe Better Attach Control © 2023
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    'gslides odp otp pot potm potx ppam pps ppsm ppsx ppt pptm pptx '
    + 'sldm sldx'
).split(' ');

export default function is_presentation(ext) {
    return EXTS.indexOf(ext) >= 0;
}