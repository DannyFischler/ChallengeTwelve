const inquirer = require('inquirer');
const { queryDB, closeDB } = require('./db');

async function runPrompts() {
    let continueRunning = true;

    while (continueRunning) {
        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ]
        });

        switch (action) {
            case 'View all departments':
                await viewAllDepartments();
                break;
            case 'View all roles':
                await viewAllRoles();
                break;
            case 'View all employees':
                await viewAllEmployees();
                break;
            case 'Add a department':
                await addDepartment();
                break;
            case 'Add a role':
                await addRole();
                break;
            case 'Add an employee':
                await addEmployee();
                break;
            case 'Update an employee role':
                await updateEmployeeRole();
                break;
            case 'Exit':
                continueRunning = false;
                break;
        }
    }

    closeDB();
}

async function viewAllDepartments() {
    try {
        const departments = await queryDB("SELECT id AS 'Department ID', name AS 'Department Name' FROM department");
        console.table(departments[0]);
    } catch (error) {
        console.error("Error fetching departments:", error);
    }
}

async function viewAllRoles() {
    try {
        const query = `
        SELECT role.id AS 'Role ID', role.title AS 'Role Title', department.name AS 'Department Name', role.salary AS Salary
        FROM role
        INNER JOIN department ON role.department_id = department.id`;
        const roles = await queryDB(query);
        console.table(roles[0]);
    } catch (error) {
        console.error("Error fetching roles:", error);
    }
}

async function viewAllEmployees() {
    try {
        const query = `
        SELECT employee.id AS 'Employee ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Role', department.name AS 'Department', role.salary AS 'Salary', CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager'
        FROM employee 
        LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_id = department.id 
        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
        const employees = await queryDB(query);
        console.table(employees[0]);
    } catch (error) {
        console.error("Error fetching employees:", error);
    }
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:'
    });

    try {
        await queryDB("INSERT INTO department (name) VALUES (?)", [name]);
        console.log(`Added department: ${name}`);
    } catch (error) {
        console.error("Error adding department:", error);
    }
}

async function addRole() {
    const departments = await queryDB("SELECT id, name FROM department");
    const { title, salary, departmentId } = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the name of the role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the role:'
        },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select the department for the role:',
            choices: departments[0].map(dept => ({ name: dept.name, value: dept.id }))
        }
    ]);

    try {
        await queryDB("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [title, salary, departmentId]);
        console.log(`Added role: ${title}`);
    } catch (error) {
        console.error("Error adding role:", error);
    }
}

async function addEmployee() {
    const roles = await queryDB("SELECT id, title FROM role");
    const employees = await queryDB("SELECT id, CONCAT(first_name, ' ', last_name) AS fullName FROM employee");

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Enter the first name of the employee:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Enter the last name of the employee:'
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the role for the employee:',
            choices: roles[0].map(role => ({ name: role.title, value: role.id }))
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select the manager for the employee:',
            choices: [...employees[0].map(emp => ({ name: emp.fullName, value: emp.id })), { name: 'None', value: null }]
        }
    ]);

    try {
        await queryDB("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [firstName, lastName, roleId, managerId]);
        console.log(`Added employee: ${firstName} ${lastName}`);
    } catch (error) {
        console.error("Error adding employee:", error);
    }
}

async function updateEmployeeRole() {
    const employees = await queryDB("SELECT id, CONCAT(first_name, ' ', last_name) AS fullName FROM employee");
    const roles = await queryDB("SELECT id, title FROM role");

    const { employeeId, roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to update:',
            choices: employees[0].map(emp => ({ name: emp.fullName, value: emp.id }))
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the new role for the employee:',
            choices: roles[0].map(role => ({ name: role.title, value: role.id }))
        }
    ]);

    try {
        await queryDB("UPDATE employee SET role_id = ? WHERE id = ?", [roleId, employeeId]);
        console.log(`Updated employee's role.`);
    } catch (error) {
        console.error("Error updating employee role:", error);
    }
}

module.exports = runPrompts;
