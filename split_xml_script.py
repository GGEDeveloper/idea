import os

def split_xml_file(input_filepath, output_dir, lines_per_chunk_param):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")

    try:
        with open(input_filepath, 'r', encoding='utf-8') as infile:
            chunk_number = 1
            lines_buffer = []
            processed_lines_total = 0
            for i, line in enumerate(infile):
                lines_buffer.append(line)
                processed_lines_total = i + 1
                if processed_lines_total % lines_per_chunk_param == 0:
                    output_filename = os.path.join(output_dir, f"chunk_{chunk_number}.xml")
                    with open(output_filename, 'w', encoding='utf-8') as outfile:
                        outfile.writelines(lines_buffer)
                    print(f"Created {output_filename} with lines {processed_lines_total - lines_per_chunk_param + 1} to {processed_lines_total}")
                    lines_buffer = []
                    chunk_number += 1
            
            if lines_buffer: # Write the last chunk if any lines are remaining
                output_filename = os.path.join(output_dir, f"chunk_{chunk_number}.xml")
                with open(output_filename, 'w', encoding='utf-8') as outfile:
                    outfile.writelines(lines_buffer)
                start_line_of_last_chunk = processed_lines_total - len(lines_buffer) + 1
                print(f"Created {output_filename} with lines {start_line_of_last_chunk} to {processed_lines_total}")
        print(f"File splitting complete. {chunk_number -1 if not lines_buffer else chunk_number} chunk(s) are in {output_dir}")
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_filepath}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # --- Configuration ---
    input_file_path = "/home/pixie/idea/data/xml/produkty_xml_3_14-06-2025_13_06_53_en.xml"
    output_directory_path = "/home/pixie/idea/data/xml_analisys/"
    # Chosen to be manageable for analysis and within typical tool limits for reading.
    num_lines_per_chunk = 1500 

    print(f"Starting XML file splitting...")
    print(f"Input file: {input_file_path}")
    print(f"Output directory: {output_directory_path}")
    print(f"Lines per chunk: {num_lines_per_chunk}")

    split_xml_file(input_file_path, output_directory_path, num_lines_per_chunk) 