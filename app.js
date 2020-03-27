const colors = require("colors");
const cowsay = require("cowsay");
const inquirer = require("inquirer");

const mongoose = require("mongoose");

//Connect to student model
const Student = require("./Models/Student");

let fullStudentArray = [];
let studentsArray = [];

// Create a connection mongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/student-selector", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(async () => {
    fullStudentArray = await Student.find();
    studentsArray = [...fullStudentArray];
    runProgram();
  });

// function to start program
function runProgram() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: [
          "Enter Random Student Selector",
          "Add students",
          "Drop Students",
          "Quit"
        ],
        name: "option"
      }
    ])
    .then(inqurerResponse => {
      const choice = inqurerResponse.option;

      switch (choice) {
        case "Enter Random Student Selector":
          if (fullStudentArray.length > 0) {
            chooseStudentMenu();
          } else {
            console.log(
              "\n!!! You must add students before choosing a random student\n"
                .red
            );
            runProgram();
          }

          break;
        case "Add students":
          addStudentMenu();
          break;
        case "Drop Students":
          if (fullStudentArray.length > 0) {
            dropStudentMenu();
            break;
          } else {
            console.log(
              "\n!!! You must add students before you can drop anyone\n".red
            );
            runProgram();
            break;
          }

        default:
          process.exit();
      }
    });
}

//drop student menu
function dropStudentMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: ["Select Students", "Drop All", "Quit"],
        name: "dropStudentOptions"
      }
    ])
    .then(res => {
      switch (res.dropStudentOptions) {
        case "Select Students":
          dropSelectStudents();
          break;

        case "Drop All":
          Student.deleteMany()
            .then(async () => {
              console.log(
                "\n!!! Entire collection of students were dropped\n".green
              );

              fullStudentArray = await Student.find();
              studentsArray = [...fullStudentArray];

              runProgram();
            })
            .catch(() => {
              console.log("nothing to delete");
            });
          break;

        default:
          runProgram();
          break;
      }
    });
}

function dropSelectStudents() {
  inquirer
    .prompt([
      {
        type: "checkbox",
        message: "Choose students to drop",
        choices: fullStudentArray,
        name: "studentsToDrop"
      }
    ])
    .then(async res => {
      if (res.studentsToDrop.length > 0) {
        res.studentsToDrop.forEach(async studentToDrop => {
          try {
            await Student.findOneAndRemove({ name: studentToDrop });
          } catch {
            console.log("there was a problem");
          }
        });

        fullStudentArray = await Student.find();
        studentsArray = [...fullStudentArray];
      } else {
        console.log("\n!!! Noone was deleted\n".red);
      }
      runProgram();
    });
}

//function that brings user to add student menu screen
function addStudentMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: ["Add Student(s)", "Quit"],
        name: "addScreenOption"
      }
    ])
    .then(inqurerResponse => {
      const choice = inqurerResponse.addScreenOption;

      switch (choice) {
        case "Add Student(s)":
          addStudent();
          break;
        default:
          runProgram();
          break;
      }
    });
}

// screen for user to input student name
function addStudent() {
  inquirer
    .prompt([
      {
        type: "input",
        message: 'Enter students name seperated by ", "\n',
        name: "newStudent"
      }
    ])
    .then(async res => {
      const newStudents = res.newStudent.split(", ");

      if (newStudents.length > 0) {
        newStudents.forEach(async student => {
          const newStudent = await Student.create({ name: student });
          newStudent.save();

          fullStudentArray = await Student.find();
          studentsArray = [...fullStudentArray];
        });
        console.log(
          "\n!!! Students were succesfully added to the database\n".green
        );
      } else {
        console.log("\n!!! No students were added to the database\n".red);
      }

      addStudentMenu();
    });
}

//pick random student menu
function chooseStudentMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: ["Pick Student", "Quit"],
        name: "userChoice"
      }
    ])
    .then(res => {
      switch (res.userChoice) {
        case "Pick Student":
          chooseStudent();
          break;

        default:
          runProgram();
          break;
      }
    });
}

function chooseStudent() {
  if (studentsArray.length > 0) {
    const randomStudentIndex = Math.floor(Math.random() * studentsArray.length);
    const randomStudent = studentsArray[randomStudentIndex];

    console.log(
      cowsay.say({
        text: "\n" + randomStudent.name + "\n",
        e: "oO",
        T: "U "
      }).rainbow + "\n"
    );

    studentsArray.splice(randomStudentIndex, 1);
  } else {
    console.log("re-populating array...".cyan);
    studentsArray = [...fullStudentArray];

    const randomStudentIndex = Math.floor(Math.random() * studentsArray.length);
    const randomStudent = studentsArray[randomStudentIndex];

    console.log(
      cowsay.say({
        text: "\n" + randomStudent.name + "\n",
        e: "oO",
        T: "U "
      }).rainbow + "\n"
    );
    studentsArray.splice(randomStudentIndex, 1);
  }
  chooseStudentMenu();
}
