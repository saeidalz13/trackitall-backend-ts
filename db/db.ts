import { DataSource } from "typeorm"

export const newPgDataSource = () => {
    const pgDataSource = new DataSource(
        {
            type: "postgres",
            host: "12"
        }
    )
}