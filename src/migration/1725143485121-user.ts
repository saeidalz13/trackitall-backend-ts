import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class User1725143485121 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          { name: "id", type: "varchar", length: "26", isPrimary: true },
          {
            name: "email",
            type: "varchar",
            length: "100",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "password",
            type: "varchar",
            length: "60",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamptz",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "timestamptz",
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
