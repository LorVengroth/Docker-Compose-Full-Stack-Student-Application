package com.example.student_api.controller;

import com.example.student_api.model.Student;
import com.example.student_api.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = "*") // អនុញ្ញាតឱ្យ Frontend call មកបានដោយមិនជាប់ CORS
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // 1. GET: ទាញយកបញ្ជីសិស្សទាំងអស់
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // 2. POST: បន្ថែមសិស្សថ្មី
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student savedStudent = studentRepository.save(student);
        return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
    }

    // 3. DELETE: លុបសិស្សតាម ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}