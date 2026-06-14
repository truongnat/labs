import { join } from "path";
import postgres from "postgres";

// ANSI escape codes for styling
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";
const GRAY = "\x1b[90m";

// Parse CLI arguments
const targetFolder = Bun.argv[2];

if (!targetFolder) {
  console.log(`${RED}${BOLD}Lỗi: Vui lòng cung cấp thư mục level muốn chạy!${RESET}`);
  console.log(`Sử dụng: ${YELLOW}bun run.ts <level-folder-name>${RESET}`);
  console.log(`Ví dụ:  ${CYAN}bun run.ts level-1-sql-co-ban${RESET}`);
  process.exit(1);
}

const folderPath = join(import.meta.dir, targetFolder);
const setupFile = join(folderPath, "setup.sql");
const exercisesFile = join(folderPath, "exercises.sql");

// Check files existence
if (!(await Bun.file(setupFile).exists())) {
  console.log(`${RED}${BOLD}Lỗi: Không tìm thấy file setup.sql tại ${setupFile}${RESET}`);
  process.exit(1);
}
if (!(await Bun.file(exercisesFile).exists())) {
  console.log(`${RED}${BOLD}Lỗi: Không tìm thấy file exercises.sql tại ${exercisesFile}${RESET}`);
  process.exit(1);
}

// Database Connection
const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "sql_labs",
  username: "postgres",
  password: "postgres",
  max: 1, // Single connection to make transaction locks and sequential execution reliable
});

async function run() {
  console.log(`\n${BOLD}${MAGENTA}========================================================================${RESET}`);
  console.log(`${BOLD}${MAGENTA}🚀 ĐANG BẮT ĐẦU CHẠY: ${RESET}${BOLD}${CYAN}${targetFolder.toUpperCase()}${RESET}`);
  console.log(`${BOLD}${MAGENTA}========================================================================${RESET}\n`);

  try {
    // 1. Run Setup SQL
    console.log(`${YELLOW}🔧 Đang khởi tạo dữ liệu (setup.sql)...${RESET}`);
    const setupSql = await Bun.file(setupFile).text();
    // Run setup scripts using unsafe block to allow multi-command DDL/DML
    await sql.unsafe(setupSql);
    console.log(`${GREEN}✅ Khởi tạo dữ liệu thành công!${RESET}\n`);

    // 2. Read and Parse Exercises SQL
    const exercisesSql = await Bun.file(exercisesFile).text();
    const parts = exercisesSql.split(/--\s*@query\s*:\s*/i);
    const queries: { description: string; sql: string }[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const lines = trimmed.split("\n");
      const description = lines[0].trim();
      const sqlText = lines.slice(1).join("\n").trim();
      if (sqlText) {
        queries.push({ description, sql: sqlText });
      }
    }

    console.log(`${YELLOW}Executing ${queries.length} exercises...${RESET}`);

    // 3. Execute queries sequentially
    let index = 1;
    for (const query of queries) {
      console.log(`\n${BOLD}${CYAN}------------------------------------------------------------------------${RESET}`);
      console.log(`${BOLD}${YELLOW}👉 Bài ${index}: ${query.description}${RESET}`);
      console.log(`${BOLD}${CYAN}------------------------------------------------------------------------${RESET}`);
      console.log(`${GRAY}${query.sql}${RESET}\n`);

      try {
        const result = await sql.unsafe(query.sql);
        
        if (result && Array.isArray(result) && result.length > 0) {
          // Display in console table
          console.table(result);
          console.log(`${GREEN}✨ Trả về ${result.length} dòng.${RESET}`);
        } else {
          // Command completed without returning rows (like UPDATE, CREATE INDEX, etc.)
          console.log(`${GREEN}✅ Thực thi thành công! (Dữ liệu trống hoặc không trả về dòng)${RESET}`);
          if (result && result.count !== undefined) {
            console.log(`${GREEN}   Số dòng bị ảnh hưởng: ${result.count}${RESET}`);
          }
        }
      } catch (err: any) {
        console.log(`${RED}${BOLD}❌ Lỗi thực thi SQL:${RESET}`);
        console.log(`${RED}${err.message}${RESET}`);
        // Reset transaction state on the connection in case it was aborted
        await sql.unsafe("ROLLBACK;").catch(() => {});
      }
      index++;
    }

    console.log(`\n${BOLD}${GREEN}========================================================================${RESET}`);
    console.log(`${BOLD}${GREEN}🎉 HOÀN THÀNH TẤT CẢ CÁC BÀI TẬP CỦA ${targetFolder.toUpperCase()}!${RESET}`);
    console.log(`${BOLD}${GREEN}========================================================================${RESET}\n`);

  } catch (err: any) {
    console.log(`${RED}${BOLD}❌ Lỗi hệ thống khi chạy setup hoặc đọc file:${RESET}`);
    console.log(`${RED}${err.stack || err.message}${RESET}`);
  } finally {
    await sql.end();
  }
}

run();
