/*
  Warnings:

  - The values [Admin] on the enum `staff_role` will be removed. If these variants are still used in the database, this will fail.
  - The values [Doctor,Nurse,Midwife,BHW] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `staff` MODIFY `role` ENUM('Doctor', 'Nurse', 'Midwife', 'BHW') NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('Admin', 'Employee') NOT NULL;
