/*
*  Frappe Better Attach Control © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to LICENSE file
*/

var EXTS = (
    '3ds apng avif azv b16 bmp cgm cmx dds djv djvu drle dwg dxf '
    + 'emf exr fbs fh fh4 fh5 fh7 fhc fits fpx fst g3 gif '
    + 'heic heics heif heifs hej2 hsj2 ico ief '
    + 'jhc jls jng jp2 jpe jpeg jpf jpg jpg2 jph jpm jpx '
    + 'jxr jxra jxrs jxs jxsc jxsi jxss ktx ktx2 mdi mmr npx '
    + 'oga ogg pbm pct pcx pgm pic png pnm ppm psd ras rgb rlc '
    + 'sgi sid spx sub svg svgz tga tif tiff uvg uvi uvvg uvvi '
    + 'wbmp wdp webp xbm xif xpm xwd'
).split(' ');

export default function is_image(ext) {
    return EXTS.indexOf(ext) >= 0;
}