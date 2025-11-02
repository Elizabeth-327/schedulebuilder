"use client";

import { useState, useEffect, FormEventHandler } from 'react';
import { getCourses } from "../supabaseAccess";
import { CourseRow } from '../types/custom';

export default function CourseSearch() {

    // STATE

    const [courses, setCourses] = useState<CourseRow[]>([]);
    const [loading, setLoading] = useState(true);

    // LIFECYCLE

    useEffect(() => {
        // after load
        const loadCourses = async () => {
            const courses = await getCourses();
            setCourses(courses);
            setLoading(false);
        };

        loadCourses();
    }, []);

    if (loading) {
        return <h2>Loading Courses...</h2>;
    }

    // HANDLERS

    function formSubmitHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem("coursesearch") as HTMLInputElement;
        let query = input.value;
        query = query.trim(); // process more
        // do something
        console.log(query);
    }

    return (
        <div>
            <form action="submit" onSubmit={formSubmitHandler}>
                <input type="text" name="coursesearch" id="coursesearch" />
            </form>
        </div>
    );
}