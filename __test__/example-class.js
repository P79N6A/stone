class Position {
  x = y = 0;
  func move (nx, ny) {
    x = nx;
    y = ny
  }
};
p = Position.new;
p.move(3, 4);
p.x = 10;
log(p.x + p.y)
