 function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(sec => {
                sec.classList.add('section-hidden');
            });
            document.getElementById(sectionId).classList.remove('section-hidden');
        }

        function showStudents() {
            const select = document.getElementById('class-select');
            const selectedClass = select.value;
            document.querySelectorAll('.students-list').forEach(list => {
                list.classList.add('d-none');
            });
            if (selectedClass) {
                document.getElementById(selectedClass).classList.remove('d-none');
            }
        }