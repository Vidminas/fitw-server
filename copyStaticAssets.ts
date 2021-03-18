import { cp } from "shelljs";

cp("-u", `.env.${process.env.NODE_ENV || "prod"}`, "build/");
cp("-u", "package.json", "build/");
cp("-ur", "public/", "build/");
cp("-ur", "src/layouts/", "build/");
cp("-ur", "src/views/", "build/");
