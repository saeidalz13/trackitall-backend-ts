import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity("tokens")
export default class Token extends BaseEntity {
  @PrimaryColumn({
    name: "jwt_token",
    type: "varchar",
    length: "300",
    nullable: false,
  })
  jwtToken!: string;

  @Column({
    name: "user_agent",
    nullable: false,
    type: "varchar",
    length: "255",
  })
  userAgent!: string;

  @Column({ name: "host_name", nullable: false, type: "varchar", length: "50" })
  hoseName!: string;
}
