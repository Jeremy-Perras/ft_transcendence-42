const GIFT_HEIGHT = 338;
const SCALE_LOW = 0.2;
const SCALE_TOP = 5;

export const giftDraw = (
  context: CanvasRenderingContext2D,
  coord: { x: number; y: number }
) => {
  const s = (GIFT_HEIGHT * SCALE_LOW) / 2;
  const tx = coord.x - s;
  const ty = coord.y - s;
  context.translate(tx, ty);
  context.scale(SCALE_LOW, SCALE_LOW);

  context.fillStyle = "#54097A";
  context.fillRect(104, 85, 24, 253);
  context.fillRect(211, 85, 24, 254);
  context.fillRect(0, 85, 338, 84);

  context.fillStyle = "#7B15A0";
  context.fillRect(22, 165, 295, 173);
  context.fillRect(22, 165, 295, 173);

  context.fillStyle = "#C55CF4";
  context.fillRect(22, 106, 295, 42);
  context.fillRect(40, 182, 64, 136);
  context.fillRect(40, 182, 64, 136);
  context.fillRect(40, 182, 64, 136);
  context.fillRect(232, 182, 64, 136);
  context.fillRect(232, 182, 64, 136);
  context.fillRect(232, 182, 64, 136);

  context.fillStyle = "#550A7C";
  context.fillRect(22, 169, 295, 21);

  context.fillStyle = "#FFB600";
  context.fill(new Path2D("M43 42H128V64H43V42Z"));
  context.fill(new Path2D("M43 42H128V64H43V42Z"));
  context.fill(new Path2D("M43 42H128V64H43V42Z"));
  context.fill(new Path2D("M43 42H128V64H43V42Z"));
  context.fill(new Path2D("M43 42H128V64H43V42Z"));
  context.fill(new Path2D("M43 42H128V64H43V42Z"));
  context.fill(new Path2D("M43 42H128V64H43V42Z"));
  context.fill(new Path2D("M43 42H128V64H43V42Z"));
  context.fill(new Path2D("M63 21H128V85H63V21Z"));
  context.fill(new Path2D("M63 21H128V85H63V21Z"));
  context.fill(new Path2D("M63 21H128V85H63V21Z"));
  context.fill(new Path2D("M63 21H128V85H63V21Z"));
  context.fill(new Path2D("M63 21H128V85H63V21Z"));
  context.fill(new Path2D("M63 21H128V85H63V21Z"));
  context.fill(new Path2D("M63 21H128V85H63V21Z"));
  context.fill(new Path2D("M63 21H128V85H63V21Z"));
  context.fill(new Path2D("M82 0H147V64H82V0Z"));
  context.fill(new Path2D("M82 0H147V64H82V0Z"));
  context.fill(new Path2D("M82 0H147V64H82V0Z"));
  context.fill(new Path2D("M82 0H147V64H82V0Z"));
  context.fill(new Path2D("M82 0H147V64H82V0Z"));
  context.fill(new Path2D("M82 0H147V64H82V0Z"));
  context.fill(new Path2D("M82 0H147V64H82V0Z"));
  context.fill(new Path2D("M82 0H147V64H82V0Z"));
  context.fill(new Path2D("M210 0H275V64H210V0Z"));
  context.fill(new Path2D("M210 0H275V64H210V0Z"));
  context.fill(new Path2D("M210 0H275V64H210V0Z"));
  context.fill(new Path2D("M210 0H275V64H210V0Z"));
  context.fill(new Path2D("M210 0H275V64H210V0Z"));
  context.fill(new Path2D("M210 0H275V64H210V0Z"));
  context.fill(new Path2D("M210 0H275V64H210V0Z"));
  context.fill(new Path2D("M210 0H275V64H210V0Z"));
  context.fill(new Path2D("M191 21H297V64H191V21Z"));
  context.fill(new Path2D("M191 21H297V64H191V21Z"));
  context.fill(new Path2D("M191 21H297V64H191V21Z"));
  context.fill(new Path2D("M191 21H297V64H191V21Z"));
  context.fill(new Path2D("M191 21H297V64H191V21Z"));
  context.fill(new Path2D("M191 21H297V64H191V21Z"));
  context.fill(new Path2D("M191 21H297V64H191V21Z"));
  context.fill(new Path2D("M191 21H297V64H191V21Z"));
  context.fill(new Path2D("M232 0H275V85H232V0Z"));
  context.fill(new Path2D("M232 0H275V85H232V0Z"));
  context.fill(new Path2D("M232 0H275V85H232V0Z"));
  context.fill(new Path2D("M232 0H275V85H232V0Z"));
  context.fill(new Path2D("M232 0H275V85H232V0Z"));
  context.fill(new Path2D("M232 0H275V85H232V0Z"));
  context.fill(new Path2D("M232 0H275V85H232V0Z"));
  context.fill(new Path2D("M232 0H275V85H232V0Z"));
  context.fill(new Path2D("M147 43H211V106H147V43Z"));
  context.fill(new Path2D("M147 43H211V106H147V43Z"));
  context.fill(new Path2D("M147 43H211V106H147V43Z"));
  context.fill(new Path2D("M147 43H211V106H147V43Z"));
  context.fill(new Path2D("M147 43H211V106H147V43Z"));
  context.fill(new Path2D("M147 43H211V106H147V43Z"));
  context.fill(new Path2D("M147 43H211V106H147V43Z"));
  context.fill(new Path2D("M147 43H211V106H147V43Z"));
  context.fill(new Path2D("M128 85H211V338H128V85Z"));
  context.fill(new Path2D("M128 85H211V338H128V85Z"));
  context.fill(new Path2D("M128 85H211V338H128V85Z"));
  context.fill(new Path2D("M128 85H211V338H128V85Z"));
  context.fill(new Path2D("M128 85H211V338H128V85Z"));
  context.fill(new Path2D("M128 85H211V338H128V85Z"));
  context.fill(new Path2D("M128 85H211V338H128V85Z"));
  context.fill(new Path2D("M128 85H211V338H128V85Z"));

  context.fillStyle = "#FDFF76";
  context.fill(new Path2D("M107 85H84V21H107V85Z"));
  context.fill(new Path2D("M107 85H84V21H107V85Z"));
  context.fill(new Path2D("M107 64H63V42H107V64Z"));
  context.fill(new Path2D("M107 64H63V42H107V64Z"));
  context.fill(new Path2D("M129 43H85V21H129V43Z"));
  context.fill(new Path2D("M129 43H85V21H129V43Z"));
  context.fill(new Path2D("M275 43H211V21H275V43Z"));
  context.fill(new Path2D("M275 43H211V21H275V43Z"));
  context.fill(new Path2D("M275 64H253V21H275V64Z"));
  context.fill(new Path2D("M275 64H253V21H275V64Z"));
  context.fill(new Path2D("M191 318H168V106H191V318Z"));
  context.fill(new Path2D("M191 318H168V106H191V318Z"));
  context.fill(new Path2D("M211 148H147V106H211V148Z"));
  context.fill(new Path2D("M211 148H147V106H211V148Z"));

  context.scale(SCALE_TOP, SCALE_TOP);
  context.translate(-tx, -ty);
};
