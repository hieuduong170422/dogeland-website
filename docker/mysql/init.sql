-- AuthMe mock schema for local development
-- Mirrors the real AuthMe plugin database structure

CREATE TABLE IF NOT EXISTS authme (
  id          INT          NOT NULL AUTO_INCREMENT,
  username    VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  ip          VARCHAR(40)  DEFAULT NULL,
  lastlogin   BIGINT       DEFAULT NULL,
  x           DOUBLE       DEFAULT 0,
  y           DOUBLE       DEFAULT 0,
  z           DOUBLE       DEFAULT 0,
  world       VARCHAR(255) DEFAULT 'world',
  regdate     BIGINT       DEFAULT NULL,
  email       VARCHAR(255) DEFAULT 'your@email.com',
  isLogged    INT          DEFAULT 0,
  totp        VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed a test player
INSERT IGNORE INTO authme (username, password, lastlogin, regdate, email)
VALUES ('TestPlayer', '$2a$10$examplehash', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000, 'test@dogeland.vn');
